import { Component, OnInit } from '@angular/core';
import { IGateEntry, IMyProfile, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { GateEntryService } from '../../../services/gate-entry.service';
import { Subject, take, takeUntil } from 'rxjs';
import { GateEntryStatus, UILabelValueType } from '../../../types';
import { FormControl } from '@angular/forms';
import { SocietyService } from '../../../services/society.service';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-visitor-list',
  templateUrl: './visitor-list.component.html',
  styleUrl: './visitor-list.component.scss'
})
export class VisitorListComponent implements OnInit {

  gateEntries: IGateEntry[] = [];
  societyOptions: IUIDropdownOption[] = [];
  flatOptions: IUIDropdownOption[] = [];

  myProfile?: IMyProfile;
  isComponentActive = new Subject<void>();

  societiesSearchControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  flatControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  selectedDateControl = new FormControl<Date | string>(new Date().toISOString().split('T')[0]);

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
    private gateEntryService: GateEntryService,
    private societyService: SocietyService,
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();
    if (!this.myProfile) {
      this.router.navigateByUrl('/');
      return;
    }

    this.subscribeToDateChange();
    this.subscribeToFlatSelection();
    this.subscribeToSocietySelection(this.myProfile);
    this.loadMySocities(this.myProfile);
  }

  getGateEntryStatusColorName(gateEntry: IGateEntry): string {
    switch (gateEntry.status) {
      case 'approved': return 'approved';
      case 'cancelled': return 'rejected';
      case 'completed': return 'approved';
      case 'expired': return 'expired';
      case 'rejected': return 'rejected';
      case 'requested': return 'pending';
    }
  }

  getGateEntryLabelType(gateEntry: IGateEntry): UILabelValueType {
    switch (gateEntry.status) {
      case 'approved': return 'active';
      case 'cancelled': return 'rejected';
      case 'completed': return 'active';
      case 'expired': return 'inactive';
      case 'rejected': return 'rejected';
      case 'requested': return 'pending';
    }
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
  subscribeToSocietySelection(myProfile: IMyProfile) {
    this.societiesSearchControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(selectedSociety => {
        this.flatControl.reset();

        const isAdmin = myProfile.user.role === 'admin';

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

    this.loadGateEntries();
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
            this.loadGateEntries();
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

          const flatOptions = response.data.map(flat => this.societyService.convertFlatToDropdownOption(flat, this.societiesSearchControl.value?.value));
          if (populate) {
            this.flatOptions = flatOptions;
            this.loadGateEntries();
          }
          resolve(flatOptions);
        });

    });
  }

  subscribeToFlatSelection() {
    this.flatControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(selectedFlat => {
        this.loadGateEntries();
      });
  }

  loadGateEntries() {
    const societyId = this.societiesSearchControl.value?.value ?? undefined;
    const flatId = this.flatControl.value?.value ?? undefined;
    const date = this.selectedDateControl.value ? new Date(this.selectedDateControl.value) : undefined;
    this.gateEntryService.getAllMyGateEntries(societyId, flatId, undefined, date)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.gateEntries = response.data;
          // this.filterEntriesByDate();
        }
      });
  }

  subscribeToDateChange(): void {
    this.selectedDateControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(selectedDateControl => {
        this.loadGateEntries();
      })
  }

  formatTime(date: Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  onApprove(gateEntry: IGateEntry): void {
    this.gateEntryService.changeStatus(gateEntry._id, 'approved')
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.loadGateEntries();
        }
      });
  }

  onReject(gateEntry: IGateEntry): void {
    this.gateEntryService.changeStatus(gateEntry._id, 'rejected')
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.loadGateEntries();
        }
      });
  }

  getStatusClass(status: GateEntryStatus): string {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'requested': return 'status-requested';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  }

}
