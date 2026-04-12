import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { ResidingTypes, ResidingTypeList } from '../../../constants';
import { ISociety, IUser, IPhoneContactFlat, IBuilding, IFlat, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { LoginService } from '../../../services/login.service';
import { MenuService } from '../../../services/menu.service';
import { NewUserService } from '../../../services/new-user.service';
import { SocietyService } from '../../../services/society.service';
import { SocietyRoles } from '../../../types';

@Component({
  selector: 'app-join-as',
  templateUrl: './join-as.component.html',
  styleUrl: './join-as.component.scss'
})
export class JoinAsComponent implements OnInit, OnDestroy {

  role: string = '';
  isSaving = false;

  fb = new FormGroup({
    society: new FormControl<ISociety | null>(null, [Validators.required]),
    building: new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]),
    flatId: new FormControl<string | null>({ value: null, disabled: true }),
    residingType: new FormControl<string | null>({ value: null, disabled: true }),
    tenantForm: new FormGroup({
      leaseStart: new FormControl<Date | null>({ value: null, disabled: true }),
      leaseEnd: new FormControl<Date | null>({ value: null, disabled: true }),
      rentAmount: new FormControl<number | null>({ value: null, disabled: true }),
    }),
    securityForm: new FormGroup({
      jobStart: new FormControl<Date | null>({ value: null, disabled: true }),
      jobEnd: new FormControl<Date | null>({ value: null, disabled: true }),
      salaryAmount: new FormControl<number | null>({ value: null, disabled: true }),
    })
  });

  userSearchFormControl = new FormControl<IUser | null>({ value: null, disabled: true });
  contactSearchFormControl = new FormControl<IPhoneContactFlat | null>({ value: null, disabled: true });
  radioFormControl = new FormControl<string>({ value: 'user', disabled: true });

  buildings: IBuilding[] = [];
  flats: IFlat[] = [];

  buildingSelectorConfig: IUIControlConfig = {
    id: 'building',
    label: 'Building',
    placeholder: 'Select Building',
    validations: [{ name: 'required', validator: Validators.required }],
    errorMessages: { required: 'Building is required' }
  };

  flatIdConfig: IUIControlConfig = {
    id: 'flatId',
    label: 'Flat',
    placeholder: 'Select Flat',
    validations: [{ name: 'required', validator: Validators.required }],
    errorMessages: { required: 'Flat is required' }
  };

  residingTypeConfig: IUIControlConfig = {
    id: 'residingType',
    label: 'Residing Type',
    validations: [{ name: 'required', validator: Validators.required }],
    errorMessages: { required: 'Residing Type is required' }
  };

  leaseStartConfig = {
    id: 'leaseStart',
    label: 'Lease Start',
    placeholder: 'Enter Lease Start'
  };

  leaseEndConfig = {
    id: 'leaseEnd',
    label: 'Lease End',
    placeholder: 'Enter Lease End'
  };

  rentAmountConfig = {
    id: 'rentAmount',
    label: 'Rent Amount',
    placeholder: 'Enter Rent Amount'
  };

  radioConfig: IUIControlConfig = {
    id: 'radio',
    label: 'Search Tenant',
    placeholder: 'Search By'
  };

  radioOptions: IUIDropdownOption[] = [
    { label: 'By App User', value: 'user' },
    { label: 'By Contact', value: 'contact' }
  ];

  jobStartConfig: IUIControlConfig = {
    id: 'jobStart',
    label: 'Job Start',
    placeholder: 'Enter Job Start',
    validations: [{ name: 'required', validator: Validators.required }],
    errorMessages: { required: 'Job Start Date is required' }
  };

  jobEndConfig: IUIControlConfig = {
    id: 'jobEnd',
    label: 'Job End',
    placeholder: 'Enter Job End'
  };

  salaryAmountConfig: IUIControlConfig = {
    id: 'salaryAmount',
    label: 'Salary Amount',
    placeholder: 'Enter Salary Amount'
  };

  private destroy$ = new Subject<void>();

  get showUserSearch(): boolean {
    return this.radioFormControl.value === 'user';
  }

  get showContactSearch(): boolean {
    return this.radioFormControl.value === 'contact';
  }

  get isResidingTypeTenant(): boolean {
    return this.fb.get('residingType')?.value === ResidingTypes.Tenant;
  }

  get isTenant(): boolean {
    return this.role === SocietyRoles.tenant;
  }

  get isSecurity(): boolean {
    return this.role === SocietyRoles.security;
  }

  get isOwner(): boolean {
    return this.role === SocietyRoles.owner;
  }

  get residingTypeOptions(): IUIDropdownOption[] {
    return ResidingTypeList.map(rt => ({ label: rt, value: rt }));
  }

  get parkingFlatOptions(): IUIDropdownOption<string>[] {
    return this.flats.map(f => ({ label: `${f.floor}:${f.flatNumber}`, value: f._id }));
  }

  get buildingOptions(): IUIDropdownOption<string>[] {
    return this.buildings.map(b => ({ label: b.buildingNumber, value: b._id }));
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private societyService: SocietyService,
    private loginService: LoginService,
    private newUserService: NewUserService,
    private menuService: MenuService
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(take(1)).subscribe(params => {
      const role = params['role'];
      if ([SocietyRoles.owner, SocietyRoles.tenant, SocietyRoles.security].includes(role)) {
        this.role = role;
        this.initializeFormSubscriptions();
      } else {
        this.router.navigate(['/user']);
      }
    });
  }

  private initializeFormSubscriptions(): void {
    this.fb.get('society')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(society => {
        this.resetAndDisable('building');
        this.resetAndDisable('flatId');
        this.resetAndDisable('residingType');
        this.resetAndDisable('tenantForm');
        this.resetAndDisable('securityForm');
        this.radioFormControl.disable();
        this.userSearchFormControl.disable();
        this.contactSearchFormControl.disable();

        if (!society) return;

        if (this.isSecurity) {
          this.enable('securityForm');
          return;
        }

        if (society.numberOfBuildings > 1) {
          this.loadSocietyBuildings(society._id);
          this.enable('building');
        } else {
          this.loadFlats(this.fb.value.society?._id ?? '');
          this.enable('flatId');
        }
      });

    this.fb.get('building')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(building => {
        this.resetAndDisable('flatId');
        this.resetAndDisable('residingType');
        this.resetAndDisable('tenantForm');
        this.resetAndDisable('securityForm');
        this.radioFormControl.disable();
        this.userSearchFormControl.disable();
        this.contactSearchFormControl.disable();

        if (!building) return;
        this.loadFlats(this.fb.value.society?._id ?? '', building);
        this.enable('flatId');
      });

    this.fb.get('flatId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(flatId => {
        this.resetAndDisable('residingType');
        this.resetAndDisable('tenantForm');
        this.resetAndDisable('securityForm');
        this.radioFormControl.disable();
        this.userSearchFormControl.disable();
        this.contactSearchFormControl.disable();

        if (!flatId) return;
        if (this.isOwner) this.enable('residingType');
        else if (this.isTenant) this.enable('tenantForm');
        else if (this.isSecurity) this.enable('securityForm');
      });

    this.fb.get('residingType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(residingType => {
        this.resetAndDisable('tenantForm');
        this.radioFormControl.disable();
        this.userSearchFormControl.disable();
        this.contactSearchFormControl.disable();

        if (residingType === ResidingTypes.Tenant) {
          this.radioFormControl.enable();
          this.userSearchFormControl.enable();
          this.contactSearchFormControl.enable();
          this.enable('tenantForm');
        }
      });
  }

  private resetAndDisable(controlName: string): void {
    this.fb.get(controlName)?.reset();
    this.fb.get(controlName)?.disable();
  }

  private enable(controlName: string): void {
    this.fb.get(controlName)?.enable();
  }

  private loadSocietyBuildings(societyId: string): void {
    this.societyService.getBuildings(societyId)
      .pipe(take(1))
      .subscribe({ next: response => this.buildings = response.data });
  }

  private loadFlats(societyId: string, buildingId?: string): void {
    this.societyService.getFlats(societyId, buildingId)
      .pipe(take(1))
      .subscribe({ next: response => this.flats = response.data });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }

  save(): void {
    switch (this.role) {
      case SocietyRoles.owner: this.saveOwner(); break;
      case SocietyRoles.tenant: this.saveTenant(); break;
      case SocietyRoles.security: this.saveSecurity(); break;
    }
  }

  private getOwnerPayload(): any {
    const formValue = this.fb.getRawValue();
    const profile = this.loginService.getProfileFromStorage();
    if (!formValue.society || !formValue.flatId || !profile || !formValue.residingType) return null;

    return {
      societyId: formValue.society._id,
      flatId: formValue.flatId,
      userId: profile.user._id,
      name: profile.user.name ?? 'No Name',
      contact: profile.user.phoneNumber,
      residingType: formValue.residingType,
      isOwner: true
    };
  }

  private getTenantPayload(): any {
    const formValue = this.fb.getRawValue();
    const profile = this.loginService.getProfileFromStorage();
    console.log('getTenantPayload = ', { profile, formValue })
    if (!formValue.society || !formValue.flatId || !profile) return null;

    const selectedUser = this.showUserSearch
      ? { userId: this.userSearchFormControl.value?._id, name: this.userSearchFormControl.value?.name, contact: this.userSearchFormControl.value?.phoneNumber }
      : { userId: undefined, name: this.contactSearchFormControl.value?.name, contact: this.contactSearchFormControl.value?.phoneNumber };

    const userForPayload = !this.isTenant ? selectedUser : {
      userId: profile.user._id,
      name: profile.user.name ?? 'No Name',
      contact: profile.user.phoneNumber
    };

    return {
      societyId: formValue.society._id,
      flatId: formValue.flatId,
      userId: userForPayload.userId,
      name: userForPayload.name,
      contact: userForPayload.contact,
      residingType: 'Tenant',
      isTenant: true,
      leaseStart: formValue.tenantForm.leaseStart,
      leaseEnd: formValue.tenantForm.leaseEnd,
      rentAmount: formValue.tenantForm.rentAmount
    };
  }

  private generateSecurityPayload(): any {
    const formValue = this.fb.getRawValue();
    const profile = this.loginService.getProfileFromStorage();
    if (!formValue.society || !profile) return null;

    return {
      societyId: formValue.society._id,
      userId: profile.user._id,
      jobStart: formValue.securityForm.jobStart,
      jobEnd: formValue.securityForm.jobEnd,
      salaryAmount: formValue.securityForm.salaryAmount
    };
  }

  private saveOwner(): void {
    const payload = this.getOwnerPayload();
    if (!payload) return;

    this.isSaving = true;
    const formValue = this.fb.getRawValue();
    if (formValue.residingType === ResidingTypes.Tenant) {
      this.saveTenant();
    }

    this.newUserService.newFlatMember(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response.success && response.token) this.updateUserToken(response.token);
          this.isSaving = false;
        },
        error: () => this.isSaving = false
      });
  }

  private saveTenant(): void {
    const payload = this.getTenantPayload();
    console.log('tenant payload = ', payload)
    if (!payload) return;

    this.isSaving = true;
    this.newUserService.newFlatMember(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response.success && response.token) this.updateUserToken(response.token);
          this.isSaving = false;
        },
        error: () => this.isSaving = false
      });
  }

  private saveSecurity(): void {
    const payload = this.generateSecurityPayload();
    if (!payload) return;

    this.isSaving = true;
    this.newUserService.newSecurity(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response.success && response.token) this.updateUserToken(response.token);
          this.isSaving = false;
        },
        error: () => this.isSaving = false
      });
  }

  private updateUserToken(token: string): void {
    this.loginService.saveTokenToStorage(token);
    this.loginService.loadProfile()
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response?.success) {
          if (this.menuService.userMenusValue.length > 1) {
            this.menuService.selectAndLoadMenu(this.menuService.userMenusValue[1]);
          } else {
            this.menuService.syncSelectedMenuWithCurrentUrl(true);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}