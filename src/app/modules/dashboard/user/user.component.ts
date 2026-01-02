import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IBuilding, IFlat, IPhoneContactFlat, ISociety, IUIControlConfig, IUIDropdownOption, IUser } from '../../../interfaces';
import { Subject, take, takeUntil } from 'rxjs';
import { SocietyService } from '../../../services/society.service';
import { ResidingTypeList, ResidingTypes } from '../../../constants';
import { LoginService } from '../../../services/login.service';
import { NewUserService } from '../../../services/new-user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit, OnDestroy {

  role: string = '';
  roles: { role: string; label: string; icon: string }[] = [
    {
      role: 'owner',
      label: 'Flat Owner',
      icon: 'home'
    },
    {
      role: 'tenant',
      label: 'Tenant',
      icon: 'tenant'
    },
    {
      role: 'security',
      label: 'Security',
      icon: 'security'
    }
  ]
  fb = new FormGroup({
    society: new FormControl<ISociety | null>(null, [Validators.required]),
    building: new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]),
    flatId: new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]),
    residingType: new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]),
    tenantForm: new FormGroup({
      leaseStart: new FormControl<Date | null>({ value: null, disabled: true }),
      leaseEnd: new FormControl<Date | null>({ value: null, disabled: true }),
      rentAmount: new FormControl<number | null>({ value: null, disabled: true }),
    }),
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
    validations: [
      { name: 'required', validator: Validators.required },
    ],
    errorMessages: {
      required: 'Building is required',
    }
  };
  flatIdConfig: IUIControlConfig = {
    id: 'flatId',
    label: 'Flat',
    placeholder: 'Select Flat',
    validations: [
      { name: 'required', validator: Validators.required },
    ],
    errorMessages: {
      required: 'Flat is required',
    }
  };
  residingTypeConfig: IUIControlConfig = {
    id: 'residingType',
    label: 'Residing Type',
    validations: [
      { name: 'required', validator: Validators.required },
    ],
    errorMessages: {
      required: 'Residing Type is required'
    }
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
    placeholder: 'Search By',
  };
  radioOptions: IUIDropdownOption[] = [
    { label: 'By App User', value: 'user' },
    { label: 'By Contact', value: 'contact' }
  ];

  isComponentActive = new Subject<void>();

  get showUserSearch(): boolean {
    return this.radioFormControl.value === 'user' ? true : false;
  }

  get showContactSearch(): boolean {
    return this.radioFormControl.value === 'contact' ? true : false;
  }

  get isResidingTypeTenant(): boolean {
    return this.fb.get('residingType')?.value === ResidingTypes.Tenant;
  }

  get isTenant(): boolean {
    return this.role === 'tenant'
  }

  get isSecurity(): boolean {
    return this.role === 'security'
  }

  get isOwner(): boolean {
    return this.role === 'owner'
  }

  get residingTypeOptions(): IUIDropdownOption[] {
    return ResidingTypeList.map(rt => {
      return {
        label: rt,
        value: rt
      } as IUIDropdownOption;
    });
  }

  get parkingFlatOptions(): IUIDropdownOption<string>[] {
    return this.flats.map(f => ({
      label: f.floor + ':' + f.flatNumber,
      value: f._id
    } as IUIDropdownOption))
  }

  get buildingOptions(): IUIDropdownOption<string>[] {
    return this.buildings.map(b => {
      return {
        label: b.buildingNumber,
        value: b._id
      } as IUIDropdownOption<string>
    });
  }

  constructor(
    private societyService: SocietyService,
    private loginService: LoginService,
    private newUserService: NewUserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fb.get('society')?.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(society => {
        this.resetAndDisable('building');
        this.resetAndDisable('flatId');
        this.resetAndDisable('residingType');
        this.resetAndDisable('tenantForm');
        this.radioFormControl.disable();
        this.userSearchFormControl.disable();
        this.contactSearchFormControl.disable();

        if (!society || this.isSecurity) return;

        if (society.numberOfBuildings > 1) {
          this.loadSocietyBuildings(society._id);
          this.enable('building');
        } else {
          this.loadFlats(this.fb.value.society?._id ?? '');
          this.enable('flatId');
        }
      })


    this.fb.get('building')?.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(building => {
        this.resetAndDisable('flatId');
        this.resetAndDisable('residingType');
        this.resetAndDisable('tenantForm');
        this.radioFormControl.disable();
        this.userSearchFormControl.disable();
        this.contactSearchFormControl.disable();

        if (!building) return;
        this.loadFlats(this.fb.value.society?._id ?? '', building);
        this.enable('flatId');
      })


    this.fb.get('flatId')?.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(flatId => {
        this.resetAndDisable('residingType');
        this.resetAndDisable('tenantForm');
        this.radioFormControl.disable();
        this.userSearchFormControl.disable();
        this.contactSearchFormControl.disable();

        if (!flatId) return;
        if (this.isOwner)
          this.enable('residingType');
        else if (this.isTenant)
          this.enable('tenantForm')
      })

    this.fb.get('residingType')?.valueChanges
      .pipe(takeUntil(this.isComponentActive))
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
      })
  }

  resetAndDisable(column: string) {
    this.fb.get(column)?.reset();
    this.fb.get(column)?.disable();
  }

  enable(column: string) {
    this.fb.get(column)?.enable();
  }

  setRole(role: string) {
    this.role = role;
  }

  reset() {
    this.role = '';
    this.fb.reset();
  }

  loadSocietyBuildings(societyId: string) {
    this.societyService.getBuildings(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.buildings = response.data;
        }
      })
  }

  loadFlats(societyId: string, buildingId?: string) {
    this.societyService.getFlats(societyId, buildingId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.flats = response.data;
        }
      })
  }

  save() {
    switch (this.role) {
      case 'owner': this.saveOwner(); break;
      case 'tenant': this.saveTenant(); break;
      case 'security': this.saveSecurity(); break;
    }
  }

  getOwnerPayload() {
    const formValue = this.fb.getRawValue();
    const profile = this.loginService.getProfileFromStorage();

    if (!formValue.society || !formValue.flatId || !profile
      || !formValue.residingType) return;

    let payload: any = {
      societyId: formValue.society._id,
      flatId: formValue.flatId,
      userId: profile.user._id,
      name: profile.user.name ?? 'No Name',
      contact: profile.user.phoneNumber,
      residingType: formValue.residingType,
      isOwner: true,
    };
    return payload;
  }

  getTenantPayload() {
    const formValue = this.fb.getRawValue();
    const profile = this.loginService.getProfileFromStorage();

    if (!formValue.society || !formValue.flatId || !profile
      || !formValue.residingType) return;

    let selectedUser = {
      userId: this.showUserSearch ? this.userSearchFormControl.value?._id : undefined,
      name: this.showUserSearch ? this.userSearchFormControl.value?.name : this.contactSearchFormControl.value?.name,
      contact: this.showUserSearch ? this.userSearchFormControl.value?.phoneNumber : this.contactSearchFormControl.value?.phoneNumber,
    }

    const userForPayload = !this.isTenant ? selectedUser : {
      userId: profile.user._id,
      name: profile.user.name ?? 'No Name',
      contact: profile.user.phoneNumber
    }

    let ownerPayload: any = {
      societyId: formValue.society._id,
      flatId: formValue.flatId,
      userId: userForPayload.userId,
      name: userForPayload.name,
      contact: userForPayload.contact,
      residingType: formValue.residingType,
      isTenant: true,
      leaseStart: formValue.tenantForm.leaseStart,
      leaseEnd: formValue.tenantForm.leaseEnd,
      rentAmount: formValue.tenantForm.rentAmount
    };
    return ownerPayload;
  }

  saveOwner() {

    let payload = this.getOwnerPayload();
    if (!payload) return;

    const formValue = this.fb.getRawValue();
    if (formValue.residingType === ResidingTypes.Tenant) {
      this.saveTenant();
    }

    this.newUserService.newFlatMember(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success || !response.token) return;

          this.updateUserToken(response.token)
        }
      });
  }

  saveTenant() {
    let payload = this.getTenantPayload();
    if (!payload) return;

    this.newUserService.newFlatMember(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success || !response.token) return;

          this.updateUserToken(response.token)
        }
      });
  }

  saveSecurity() { }

  updateUserToken(token: string) {
    this.loginService.saveTokenToStorage(token);
    this.loginService.loadProfile()
      .pipe(take(1))
      .subscribe((response: any) => {

        if (!response || !response.success) {
          return;
        }

        // this.router.navigateByUrl('/dashboard');

      })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
