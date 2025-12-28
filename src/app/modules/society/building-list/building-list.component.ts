import { Component, OnDestroy, OnInit } from '@angular/core';
import { IBuilding, IManager, IPhoneContactFlat, ISociety, IUIControlConfig, IUIDropdownOption, IUser } from '../../../interfaces';
import { LoginService } from '../../../services/login.service';
import { PERMISSIONS } from '../../../constants';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { Subject, take, takeUntil } from 'rxjs';
import { UILabelValueType } from '../../../types';

@Component({
  selector: 'app-building-list',
  templateUrl: './building-list.component.html',
  styleUrl: './building-list.component.scss'
})
export class BuildingListComponent implements OnInit, OnDestroy {

  societyId?: string;
  society?: ISociety;
  buildings: IBuilding[] = [];

  loading: boolean = false;
  isComponentActive = new Subject<void>();
  buildingNumberConfig: IUIControlConfig = {
    id: 'buildingNumber',
    label: 'Building Number',
    placeholder: 'Enter Building Name/Number',
    validations: [
      { name: 'required', validator: Validators.required }
    ],
    errorMessages: {
      required: 'Building Number is required'
    }
  };
  floorsConfig: IUIControlConfig = {
    id: 'floors',
    label: 'Floors',
    placeholder: 'Enter Floors Count',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'min', validator: Validators.min(1) }
    ],
    errorMessages: {
      required: 'Floors count is required',
      min: 'There can be 1 or more floors'
    }
  };
  needManagerConfig: IUIControlConfig = {
    id: 'needManager',
    label: 'Building Manager',
  };
  radioConfig: IUIControlConfig = {
    id: 'radio',
    label: 'Radio',
    placeholder: 'Search By',
    validations: [
      { name: 'required', validator: Validators.required },
    ],
    errorMessages: {
      required: 'Radio is required'
    }
  };
  pendingBuildingsConfig: IUIControlConfig = {
    id: 'pendingBuildings',
    label: 'Pending Buildings To Add'
  };

  needManagerOptions: IUIDropdownOption[] = [
    { label: 'Need Separate Manager ?', value: true },
  ];
  radioOptions: IUIDropdownOption[] = [
    { label: 'By App User', value: 'user' },
    { label: 'By Contact', value: 'contact' }
  ];

  userSearchFormControl = new FormControl<IUser | null>({ value: null, disabled: false });
  contactSearchFormControl = new FormControl<IPhoneContactFlat | null>(null);
  needManagerFormControl = new FormControl<boolean[]>([]);
  radioFormControl = new FormControl<string>('user');

  fb = new FormGroup({
    _id: new FormControl<string | undefined>(''),
    buildingNumber: new FormControl<string>('', [Validators.required]),
    societyId: new FormControl<string>('', Validators.required),
    floors: new FormControl<number>(0, [Validators.required, Validators.min(1)]),
    managerId: new FormControl<IManager | null>({ value: null, disabled: true }, [Validators.required])
  });

  get showUserSearch(): boolean {
    return this.radioFormControl.value === 'user' ? true : false;
  }

  get showContactSearch(): boolean {
    return this.radioFormControl.value === 'contact' ? true : false;
  }

  get selectedBuildingId(): string | undefined {
    return this.fb.get('_id')?.value ?? undefined;
  }

  get canAddBuildings(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.building_add, this.societyId);
  }

  get canUpdateBuildings(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.building_update, this.societyId);
  }

  get canDeleteBuildings(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.building_delete, this.societyId);
  }

  get needManager(): boolean {
    return this.needManagerFormControl.value && this.needManagerFormControl.value.length > 0
      ? this.needManagerFormControl.value[0]
      : false
  }

  get pendingBuildingsToAdd(): number {
    return (this.society?.numberOfBuildings ?? 0) - this.buildings.length;
  }

  get pendingBuildingType(): UILabelValueType {
    if (this.pendingBuildingsToAdd < 0)
      return 'error';
    else if (this.pendingBuildingsToAdd > 0)
      return 'active';
    else
      return 'info'
  }

  constructor(
    private loginService: LoginService,
    private societyService: SocietyService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.societyId = this.route.snapshot.paramMap.get('id')!;
    if (!this.societyId) this.router.navigateByUrl('');

    this.subscribeToRadioChange()
    this.resetBuildingForm();
    this.loadSociety(this.societyId);
    this.loadSocietyBuildings(this.societyId)
  }

  resetManagerSearch() {
    this.fb.get('managerId')?.reset();
    this.userSearchFormControl.reset();
    this.contactSearchFormControl.reset();
  }

  subscribeToRadioChange() {
    this.needManagerFormControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(needManager => {
        this.resetManagerSearch();
        if (needManager && needManager.length > 0)
          this.fb.get('managerId')?.enable();
        else
          this.fb.get('managerId')?.disable();
      })

    this.radioFormControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(value => {
        this.resetManagerSearch();
      });

    this.userSearchFormControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(user => {
        this.fb.get('managerId')?.reset();
        if (!user) return;

        this.fb.get('managerId')?.setValue({
          name: user.name ?? 'No Name',
          phoneNumber: user.phoneNumber,
          _id: user._id
        });
      })

    this.contactSearchFormControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(contact => {
        this.fb.get('managerId')?.reset();
        if (!contact) return;

        this.fb.get('managerId')?.setValue({
          name: contact.name, phoneNumber: contact.phoneNumber
        });
      })
  }

  resetBuildingForm(existingBuilding?: IBuilding) {
    if (!this.societyId) return;
    this.resetManagerSearch();

    const managerId = !existingBuilding || !existingBuilding.managerId || typeof existingBuilding.managerId === 'string'
      ? null
      : existingBuilding.managerId;

    console.log('managerId = ', managerId)

    this.needManagerFormControl.setValue(managerId ? [true] : []);
    this.radioFormControl.setValue('user');


    this.fb.patchValue({
      _id: existingBuilding?._id ?? undefined,
      buildingNumber: existingBuilding?.buildingNumber ?? '',
      societyId: this.societyId,
      floors: existingBuilding?.floors ?? 1,
      managerId: managerId as IManager
    });
    this.fb.markAsUntouched();
    this.fb.markAsPristine();
    this.userSearchFormControl.setValue(managerId);
  }

  loadSociety(societyId: string) {
    this.societyService.getSociety(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.society = response;
        }
      })
  }

  loadSocietyBuildings(societyId: string) {
    this.loading = true;

    this.societyService.getBuildings(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.buildings = response.data;
        },
        error: () => {
          this.loading = false;
        }
      })
  }

  addBuilding() {
    if (this.fb.invalid || !this.societyId) return;

    this.societyService.newBuilding(this.societyId, this.fb.value)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadSocietyBuildings(this.societyId ?? '');
          this.resetBuildingForm();
        }
      })
  }

  editBuilding() {
    if (this.fb.invalid || !this.selectedBuildingId || !this.societyId) return;

    this.societyService.updateBuilding(this.societyId, this.selectedBuildingId, {
      buildingNumber: this.fb.value.buildingNumber,
      societyId: this.fb.value.societyId,
      floors: this.fb.value.floors,
      managerId: this.fb.value.managerId
    })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadSocietyBuildings(this.societyId ?? '');
          this.resetBuildingForm();
        }
      })
  }

  deleteBuilding(building: IBuilding) {
    if (!this.societyId) return;

    this.societyService.deleteBuilding(this.societyId, building._id)
      .pipe(take(1))
      .subscribe({
        next: (value) => {
          this.loadSocietyBuildings(this.societyId ?? '');
          this.resetBuildingForm();
        },
      })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
