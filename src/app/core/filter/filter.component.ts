import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IMyProfile, IUIControlConfig, IUIDropdownOption } from '../../interfaces';
import { Subject, debounceTime, distinctUntilChanged, switchMap, take, takeUntil } from 'rxjs';
import { SocietyService } from '../../services/society.service';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { DatePipe } from '@angular/common';

type DropDownControl = IUIDropdownOption | undefined | null;
type DateControl = Date | undefined | null | string;

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss'
})
export class FilterComponent implements OnInit, OnDestroy {

  @Input() societyControlSizes: number[] = [12, 5, 5];
  @Input() flatControlSizes: number[] = [12, 5, 5];
  @Input() loadFirstSociety = false;
  @Input() dropDownControlConfigs: IUIControlConfig<DropDownControl>[] = [];
  @Input() dateControlConfigs: IUIControlConfig<DateControl>[] = [];
  @Output() isFlatMemberChanged = new EventEmitter<boolean>();
  @Output() filterChanged = new EventEmitter<any>();

  isFilterOpen = false;

  societiesSearchConfig: IUIControlConfig<DropDownControl> = {
    id: 'societyId',
    label: 'Society',
    placeholder: 'Search Society',
    formControl: new FormControl<DropDownControl>(undefined),
    dropDownOptions: []
  };
  flatSearchConfig: IUIControlConfig<DropDownControl> = {
    id: 'flatId',
    label: 'Flat',
    placeholder: 'Search Flat',
    formControl: new FormControl<DropDownControl>(undefined),
    dropDownOptions: []
  };

  myProfile?: IMyProfile;
  private search$ = new Subject<string>();
  protected isComponentActive = new Subject<void>();

  filterFormGroup?: FormGroup;

  get allDropDownConfig() {
    return [this.societiesSearchConfig, this.flatSearchConfig, ...this.dropDownControlConfigs]
  }

  constructor(
    private fb: FormBuilder,
    private societyService: SocietyService,
    private loginService: LoginService,
    private router: Router,
    public windowService: WindowService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();
    if (!this.myProfile) {
      this.router.navigateByUrl('/');
      return;
    }

    // Initialize Form Controls
    const formControls = [this.societiesSearchConfig, this.flatSearchConfig, ...this.dropDownControlConfigs, ...this.dateControlConfigs].reduce((acc, ctrl) => {
      if (ctrl.formControl) acc[ctrl.id] = ctrl.formControl

      return acc;
    }, {} as any);

    this.filterFormGroup = this.fb.group({
      ...formControls
    });

    // Subcribe society and flat selection changes
    this.subscribeToFlatSelection();
    this.subscribeToSocietySelection(this.myProfile);
    this.subscribeToOtherControlChanges();
    if (this.myProfile.user.role === 'admin')
      this.subscribeToSocietySearch();
    else
      this.loadMySocities(this.myProfile);
  }

  getAllFields(): string[] {
    const formValue = this.filterFormGroup?.value;
    return Object.keys(formValue ?? {})
  }

  getFieldLabel(colId: string) {
    return this.allDropDownConfig.find(c => c.id === colId)?.label
      ?? this.dateControlConfigs.find(c => c.id === colId)?.label
  }

  getFieldValue(colId: string) {
    const formValue: any = this.filterFormGroup?.value;

    if (this.allDropDownConfig.find(c => c.id === colId))
      return formValue[colId]?.value;
    else if (this.dateControlConfigs.find(c => c.id === colId))
      return formValue[colId];
  }

  getFieldText(colId: string) {
    const formValue: any = this.filterFormGroup?.value;

    if (this.allDropDownConfig.find(c => c.id === colId))
      return formValue[colId]?.label ?? 'ALL';
    else if (this.dateControlConfigs.find(c => c.id === colId))
      return this.datePipe.transform(formValue[colId]);
  }

  loadMySocities(myProfile: IMyProfile) {
    this.societyService.getAllSocieties()
      .pipe(take(1))
      .subscribe({
        next: response => {
          const socities = response.data;
          this.societiesSearchConfig.dropDownOptions = socities.map(s => ({
            label: s.societyName,
            value: s._id
          } as IUIDropdownOption));

          if (socities.length > 0 && this.loadFirstSociety) {
            this.societiesSearchConfig.formControl?.setValue({ label: socities[0].societyName, value: socities[0]._id });
          } else {
            this.loadDefaultFlats(myProfile);
          }
        }
      });
  }

  amIAMember(myProfile: IMyProfile, sid?: string) {
    const societyId = sid ?? this.societiesSearchConfig.formControl?.value?.value;

    const isFlatMember = myProfile.socities
      .filter(s => !societyId || s.societyId === societyId)
      .some(s => s?.societyRoles?.some(sr => ['owner', 'member', 'tenant'].includes(sr.name)))
      ?? false;
    this.isFlatMemberChanged.emit(isFlatMember);
  }

  onSocietySearch(searchString: string) {
    this.search$.next(searchString);
  }

  subscribeToOtherControlChanges() {
    this.dropDownControlConfigs.forEach(controlConfig => {
      if (!controlConfig.formControl) return;

      controlConfig.formControl.valueChanges
        .pipe(takeUntil(this.isComponentActive))
        .subscribe(() => this.emitSelectedFilter())
    });


    this.dateControlConfigs.forEach(controlConfig => {
      if (!controlConfig.formControl) return;

      controlConfig.formControl.valueChanges
        .pipe(takeUntil(this.isComponentActive))
        .subscribe(() => this.emitSelectedFilter())
    });
  }

  subscribeToSocietySearch() {
    this.search$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      takeUntil(this.isComponentActive),
      switchMap(searchString => {
        this.societiesSearchConfig.dropDownOptions = [];
        return this.societyService.searchSocieties(searchString).pipe(takeUntil(this.isComponentActive))
      })
    )
      .subscribe({
        next: users => {
          if (!users.success) return;

          const socities = users.data;
          this.societiesSearchConfig.dropDownOptions = socities.map(s => ({
            label: s.societyName,
            value: s._id
          } as IUIDropdownOption));
        }
      });
  }

  subscribeToSocietySelection(myProfile: IMyProfile) {
    this.societiesSearchConfig.formControl?.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(selectedSociety => {
        this.flatSearchConfig.formControl?.setValue(undefined, { emitEvent: false });

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
  async loadDefaultFlats(myProfile: IMyProfile) {
    const isAdmin = myProfile.user.role === 'admin';

    const managerOfSocities = myProfile.socities.filter(s => s.societyRoles.some(sr => ['manager', 'societyadmin'].includes(sr.name)));
    const isFlatMember = myProfile.socities.some(s => s.societyRoles.some(sr => ['owner', 'member', 'tenant'].includes(sr.name)));

    // If I am admin then clear all flats and complaints list
    if (isAdmin) {
      this.flatSearchConfig.dropDownOptions = [];
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

      this.flatSearchConfig.dropDownOptions = societyFlats;
    }

    this.emitSelectedFilter();
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
            this.flatSearchConfig.dropDownOptions = flatOptions;
            this.emitSelectedFilter();
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

          const flatOptions = response.data.map(flat => this.societyService.convertFlatToDropdownOption(flat, this.societiesSearchConfig.formControl?.value?.value));
          if (populate) {
            this.flatSearchConfig.dropDownOptions = flatOptions;
            this.emitSelectedFilter();
          }
          resolve(flatOptions);
        });

    });
  }

  subscribeToFlatSelection() {
    this.flatSearchConfig.formControl?.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(selectedFlat => {
        this.emitSelectedFilter();
      });
  }

  emitSelectedFilter() {
    setTimeout(() => {
      const formValue: any = this.filterFormGroup?.value;
      if (!formValue) return;

      const newFilter = Object.keys(formValue).reduce((acc, colId) => {
        acc[colId] = this.getFieldValue(colId);

        return acc;
      }, {} as any);
      this.filterChanged.emit(newFilter);
    }, 100);
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
