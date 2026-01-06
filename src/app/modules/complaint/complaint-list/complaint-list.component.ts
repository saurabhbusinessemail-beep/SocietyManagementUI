import { Component, OnDestroy, OnInit } from '@angular/core';
import { IComplaint, IFlat, IMyProfile, ISociety, ISocietyRole, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, take, takeUntil } from 'rxjs';
import { SocietyService } from '../../../services/society.service';
import { ComplaintService } from '../../../services/complaint.service';

@Component({
  selector: 'app-complaint-list',
  templateUrl: './complaint-list.component.html',
  styleUrl: './complaint-list.component.scss'
})
export class ComplaintListComponent implements OnInit, OnDestroy {

  complaints: IComplaint[] = [];

  myProfile?: IMyProfile;
  societyOptions: IUIDropdownOption[] = [];
  flatOptions: IUIDropdownOption[] = [];

  isFlatMember: boolean = false;

  private search$ = new Subject<string>();
  protected isComponentActive = new Subject<void>();

  societiesSearchControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  flatControl = new FormControl<IUIDropdownOption | undefined>(undefined);

  societiesSearchConfig: IUIControlConfig = {
    id: 'society',
    label: 'Society',
    placeholder: 'Search Society',
  };
  flatSearchConfig: IUIControlConfig = {
    id: 'flat',
    label: 'Flat',
    placeholder: 'Search Flat',
  };

  constructor(
    private loginService: LoginService,
    private router: Router,
    private societyService: SocietyService,
    private complaintService: ComplaintService
  ) { }

  getSociety(complaint: IComplaint): ISociety | undefined {
    return typeof complaint.societyId === 'string' ? undefined : complaint.societyId
  }

  getFlat(complaint: IComplaint): IFlat | undefined {
    return typeof complaint.flatId === 'string' ? undefined : complaint.flatId
  }

  isStatusTransitionAllowed(complaint: IComplaint, nextStatus: string): boolean {
    return this.complaintService.isStatusTransitionAllowed(complaint.status, nextStatus);
  }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();
    if (!this.myProfile) {
      this.router.navigateByUrl('/');
      return;
    }

    this.amIAMember(this.myProfile)
    this.subscribeToFlatSelection();
    this.subscribeToSocietySelection(this.myProfile);
    if (this.myProfile.user.role === 'admin')
      this.subscribeToSocietySearch();
    else
      this.loadMySocities(this.myProfile);
  }

  amIAMember(myProfile: IMyProfile, sid?: string) {
    const societyId = sid ?? this.societiesSearchControl.value?.value;

    this.isFlatMember = myProfile.socities
      .filter(s => !societyId || s.societyId === societyId)
      .some(s => s?.societyRoles?.some(sr => ['owner', 'member', 'tenant'].includes(sr.name)))
      ?? false;
  }

  amIManagerOfSociety(complaint: IComplaint) {
    const societyId = typeof complaint.societyId === 'string' ? complaint.societyId : complaint.societyId._id;

    if (!this.myProfile || !societyId) return false;

    return this.myProfile.socities
      .find(s => s.societyId === societyId)
      ?.societyRoles?.some(sr => ['manager', 'societyadmin'].includes(sr.name))
      ?? false;
  }

  loadMySocities(myProfile: IMyProfile) {
    this.societyService.getAllSocieties()
      .pipe(take(1))
      .subscribe({
        next: response => {
          const socities = response.data;
          this.societyOptions = socities.map(s => ({
            label: s.societyName,
            value: s._id
          } as IUIDropdownOption));

          if (socities.length === 1) {
            this.societiesSearchControl.setValue({ label: socities[0].societyName, value: socities[0]._id });
          } else {
            this.loadDefaultFlats(myProfile);
          }
        }
      });
  }

  onSocietySearch(searchString: string) {
    this.search$.next(searchString);
  }

  subscribeToSocietySearch() {
    this.search$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      takeUntil(this.isComponentActive),
      switchMap(searchString => {
        this.societyOptions = [];
        return this.societyService.searchSocieties(searchString).pipe(takeUntil(this.isComponentActive))
      })
    )
      .subscribe({
        next: users => {
          if (!users.success) return;

          const socities = users.data;
          this.societyOptions = socities.map(s => ({
            label: s.societyName,
            value: s._id
          } as IUIDropdownOption));
        }
      });
  }

  subscribeToSocietySelection(myProfile: IMyProfile) {
    this.societiesSearchControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(selectedSociety => {

        const isAdmin = myProfile.user.role === 'admin';
        if (this.myProfile) this.amIAMember(this.myProfile);

        if (selectedSociety) {
          const isManager = myProfile.socities.find(s => s.societyId === selectedSociety.value)?.societyRoles?.find(sr => ['manager', 'societyadmin'].includes(sr.name));
          const isFlatMember = myProfile.socities.find(s => s.societyId === selectedSociety.value)?.societyRoles?.find(sr => ['owner', 'member', 'tenant'].includes(sr.name));

          // If I am society manager or admin then load all flats from society
          if (isAdmin || isManager) this.loadSocietyFlats(selectedSociety.value)

          // If I am society flat owner/tenanat/member load only flat I am related to
          else if (isFlatMember) this.loadAllMyFlats(selectedSociety.value)

        } else {
          this.loadDefaultFlats(myProfile);
        }

      });
  }

  convertFlatToDropdownOption(flat: IFlat, societyId?: string): IUIDropdownOption {
    const buildingNumber = flat.buildingId && typeof flat.buildingId !== 'string' ? flat.buildingId.buildingNumber + ': ' : '';
    const societyName = !societyId && flat.societyId && typeof flat.societyId !== 'string' ? '-' + flat.societyId.societyName : '';
    const flatNumber = flat.floor + ':' + flat.flatNumber;

    return {
      label: buildingNumber + flatNumber + societyName,
      value: flat._id
    } as IUIDropdownOption
  }

  async loadDefaultFlats(myProfile: IMyProfile) {

    const isAdmin = myProfile.user.role === 'admin';

    const managerOfSocities = myProfile.socities.filter(s => s.societyRoles.some(sr => ['manager', 'societyadmin'].includes(sr.name)));
    const isFlatMember = myProfile.socities.some(s => s.societyRoles.some(sr => ['owner', 'member', 'tenant'].includes(sr.name)));

    // If I am admin then clear all flats and complaints list
    if (isAdmin) {
      this.flatOptions = [];
      return;
    }

    // If I am society manager then show all flats of those society
    let societyFlats: IUIDropdownOption<any>[] = [];
    if (managerOfSocities.length > 0) {
      const societyFlatsObs = managerOfSocities.map(s => this.loadSocietyFlats(s.societyId, false));
      const societyFlatsArr = await Promise.all(societyFlatsObs);
      societyFlatsArr.forEach(sf => sf.forEach(f => societyFlats.push(f)));
    }


    // If I am society flat owner/tenanat/member load all my flats
    if (isFlatMember) {
      const allFlats = await this.loadAllMyFlats(undefined, false);
      allFlats.forEach(f => societyFlats.push(f));

      this.flatOptions = societyFlats;
    }

    this.loadComplaints();
  }

  loadAllMyFlats(societyId?: string, populate = true): Promise<IUIDropdownOption<any>[]> {
    return new Promise(resolve => {

      this.societyService.myFlats(societyId)
        .pipe(take(1))
        .subscribe(response => {
          if (!response.success) {
            resolve([]);
            return;
          }

          const flatOptions = response.data.map(flatMember => this.societyService.convertFlatMemberToDropdownOption(flatMember));
          if (populate) {
            this.flatOptions = flatOptions;
            this.loadComplaints();
          }
          resolve(flatOptions);
        });

    });
  }

  loadSocietyFlats(societyId: string, populate = true): Promise<IUIDropdownOption<any>[]> {
    return new Promise(resolve => {

      this.societyService.getFlats(societyId)
        .pipe(take(1))
        .subscribe(response => {
          if (!response.success) {
            resolve([]);
            return;
          }

          const flatOptions = response.data.map(flat => this.convertFlatToDropdownOption(flat, this.societiesSearchControl.value?.value));
          if (populate) {
            this.flatOptions = flatOptions;
            this.loadComplaints();
          }
          resolve(flatOptions);
        });

    });
  }

  subscribeToFlatSelection() {
    this.flatControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(selectedFlat => {
        this.loadComplaints();
      });
  }

  async openAddComplaint() {
    const societyId = this.societiesSearchControl.value?.value;
    const flatId = this.flatControl.value?.value;

    if (societyId && flatId)
      this.router.navigate(['complaints', societyId, 'add', flatId]);
    else if (societyId)
      this.router.navigate(['complaints', societyId, 'add']);
    else if (flatId)
      this.router.navigate(['complaints', 'add', flatId]);
    else
      this.router.navigate(['complaints', 'add']);
  }

  loadComplaints() {
    this.complaintService.getComplaints(this.societiesSearchControl.value?.value, this.flatControl.value?.value)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.complaints = response.data
        }
      });
  }

  changeStatus(complaint: IComplaint, newStatus: string) {
    if (!this.isStatusTransitionAllowed(complaint, newStatus)) return;

    this.complaintService.changeStatus(complaint._id, newStatus)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response.success) this.loadComplaints();
        }
      })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
