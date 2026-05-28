import { Component, inject, OnDestroy, OnInit } from '@angular/core';
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
import { PendingHttpService } from '../../../services/pending-http.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-join-as',
  templateUrl: './join-as.component.html',
  styleUrl: './join-as.component.scss'
})
export class JoinAsComponent implements OnInit, OnDestroy {


  private pendingHttpService = inject(PendingHttpService);

  role: string = '';
  isSaving = false;
  isLoadingBuildings = false;
  isLoadingFlats = false;

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

  buildingSelectorConfig!: IUIControlConfig;
  flatIdConfig!: IUIControlConfig;
  residingTypeConfig!: IUIControlConfig;
  leaseStartConfig!: any;
  leaseEndConfig!: any;
  rentAmountConfig!: any;
  radioConfig!: IUIControlConfig;
  jobStartConfig!: IUIControlConfig;
  jobEndConfig!: IUIControlConfig;
  salaryAmountConfig!: IUIControlConfig;

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
    return [
      { label: this.translate.instant('JOIN_AS.RESIDING_SELF') || ResidingTypes.Self, value: ResidingTypes.Self },
      { label: this.translate.instant('JOIN_AS.RESIDING_VACANT') || ResidingTypes.Vacant, value: ResidingTypes.Vacant }
    ];
  }

  get radioOptions(): IUIDropdownOption[] {
    return [
      { label: this.translate.instant('JOIN_AS.BY_APP_USER') || 'By App User', value: 'user' },
      { label: this.translate.instant('JOIN_AS.BY_CONTACT') || 'By Contact', value: 'contact' }
    ];
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
    private menuService: MenuService,
    private translate: TranslateService
  ) { }

  translateConfigs(): void {
    this.buildingSelectorConfig = {
      id: 'building',
      label: this.translate.instant('JOIN_AS.BUILDING') || 'Building',
      placeholder: this.translate.instant('JOIN_AS.SELECT_BUILDING') || 'Select Building',
      validations: [{ name: 'required', validator: Validators.required }],
      errorMessages: { required: this.translate.instant('JOIN_AS.BUILDING_REQUIRED') || 'Building is required' }
    };

    this.flatIdConfig = {
      id: 'flatId',
      label: this.translate.instant('JOIN_AS.FLAT') || 'Flat',
      placeholder: this.translate.instant('JOIN_AS.SELECT_FLAT') || 'Select Flat',
      validations: [{ name: 'required', validator: Validators.required }],
      errorMessages: { required: this.translate.instant('JOIN_AS.FLAT_REQUIRED') || 'Flat is required' }
    };

    this.residingTypeConfig = {
      id: 'residingType',
      label: this.translate.instant('JOIN_AS.RESIDING_TYPE') || 'Residing Type',
      validations: [{ name: 'required', validator: Validators.required }],
      errorMessages: { required: this.translate.instant('JOIN_AS.RESIDING_TYPE_REQUIRED') || 'Residing Type is required' }
    };

    this.leaseStartConfig = {
      id: 'leaseStart',
      label: this.translate.instant('JOIN_AS.LEASE_START') || 'Lease Start',
      placeholder: this.translate.instant('JOIN_AS.ENTER_LEASE_START') || 'Enter Lease Start'
    };

    this.leaseEndConfig = {
      id: 'leaseEnd',
      label: this.translate.instant('JOIN_AS.LEASE_END') || 'Lease End',
      placeholder: this.translate.instant('JOIN_AS.ENTER_LEASE_END') || 'Enter Lease End'
    };

    this.rentAmountConfig = {
      id: 'rentAmount',
      label: this.translate.instant('JOIN_AS.RENT_AMOUNT') || 'Rent Amount',
      placeholder: this.translate.instant('JOIN_AS.ENTER_RENT_AMOUNT') || 'Enter Rent Amount'
    };

    this.radioConfig = {
      id: 'radio',
      label: this.translate.instant('JOIN_AS.SEARCH_TENANT') || 'Search Tenant',
      placeholder: this.translate.instant('JOIN_AS.SEARCH_BY') || 'Search By'
    };

    this.jobStartConfig = {
      id: 'jobStart',
      label: this.translate.instant('JOIN_AS.JOB_START') || 'Job Start',
      placeholder: this.translate.instant('JOIN_AS.ENTER_JOB_START') || 'Enter Job Start',
      validations: [{ name: 'required', validator: Validators.required }],
      errorMessages: { required: this.translate.instant('JOIN_AS.JOB_START_REQUIRED') || 'Job Start Date is required' }
    };

    this.jobEndConfig = {
      id: 'jobEnd',
      label: this.translate.instant('JOIN_AS.JOB_END') || 'Job End',
      placeholder: this.translate.instant('JOIN_AS.ENTER_JOB_END') || 'Enter Job End'
    };

    this.salaryAmountConfig = {
      id: 'salaryAmount',
      label: this.translate.instant('JOIN_AS.SALARY_AMOUNT') || 'Salary Amount',
      placeholder: this.translate.instant('JOIN_AS.ENTER_SALARY_AMOUNT') || 'Enter Salary Amount'
    };
  }

  getPageTitle(): string {
    if (this.isOwner) {
      return this.translate.instant('JOIN_AS.PAGE_TITLE_OWNER') || 'Join as Owner';
    }
    if (this.isTenant) {
      return this.translate.instant('JOIN_AS.PAGE_TITLE_TENANT') || 'Join as Tenant';
    }
    if (this.isSecurity) {
      return this.translate.instant('JOIN_AS.PAGE_TITLE_SECURITY') || 'Join as Security';
    }
    return '';
  }

  ngOnInit(): void {
    this.translateConfigs();
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.translateConfigs();
    });

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
    this.isLoadingBuildings = true;
    this.societyService.getBuildings(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.buildings = response.data;
          this.isLoadingBuildings = false;
        },
        error: () => this.isLoadingBuildings = false
      });
  }

  private loadFlats(societyId: string, buildingId?: string): void {
    this.isLoadingFlats = true;
    this.societyService.getFlats(societyId, buildingId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.flats = response.data;
          this.isLoadingFlats = false;
        },
        error: () => this.isLoadingFlats = false
      });
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

    this.pendingHttpService.addRequest('join-as', { message: this.translate.instant('JOIN_AS.JOINING_OWNER') || 'Joining as Owner...' });
    this.newUserService.newFlatMember(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.pendingHttpService.removeRequest('join-as', true, response.message);
          if (response.success && response.token) this.updateUserToken(response.token, '/society/pendingApproval/flats');
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
          this.pendingHttpService.removeRequest('join-as', false);
        }
      });
  }

  private saveTenant(): void {
    const payload = this.getTenantPayload();
    console.log('tenant payload = ', payload)
    if (!payload) return;

    this.isSaving = true;
    this.pendingHttpService.addRequest('join-as', { message: this.translate.instant('JOIN_AS.JOINING_TENANT') || 'Joining as Tenant...' });
    this.newUserService.newFlatMember(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.pendingHttpService.removeRequest('join-as', true, response.message);
          if (response.success && response.token) this.updateUserToken(response.token, '/society/pendingApproval/flats');
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
          this.pendingHttpService.removeRequest('join-as', false);
        }
      });
  }

  private saveSecurity(): void {
    const payload = this.generateSecurityPayload();
    if (!payload) return;

    this.isSaving = true;
    this.pendingHttpService.addRequest('join-as', { message: this.translate.instant('JOIN_AS.JOINING_SECURITY') || 'Joining as Security...' });
    this.newUserService.newSecurity(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.pendingHttpService.removeRequest('join-as', true, response.message);
          if (response.success && response.token) this.updateUserToken(response.token, '/society/pendingApproval/security');
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
          this.pendingHttpService.removeRequest('join-as', false);
        }
      });
  }

  private updateUserToken(token: string, url?: string): void {
    this.loginService.saveTokenToStorage(token);
    this.loginService.loadProfile()
      .pipe(take(1))
      .subscribe((response: any) => {
        if (response?.success) {
          if (url) this.router.navigateByUrl(url);
          // if (this.menuService.userMenusValue.length > 1) {
          //   this.menuService.selectAndLoadMenu(this.menuService.userMenusValue[1]);
          // } else {
          //   this.menuService.syncSelectedMenuWithCurrentUrl(true);
          // }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}