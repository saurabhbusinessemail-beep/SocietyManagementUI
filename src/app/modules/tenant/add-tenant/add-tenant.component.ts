import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IFlatMember, IPhoneContactFlat, ISelectedUser, IUIControlConfig, IUIDropdownOption, IUser } from '../../../interfaces';
import { SocietyService } from '../../../services/society.service';
import { take } from 'rxjs';
import { ResidingTypes } from '../../../constants';
import { NewUserService } from '../../../services/new-user.service';
import { DialogService } from '../../../services/dialog.service';
import { ActivatedRoute } from '@angular/router';
import { PendingHttpService } from '../../../services/pending-http.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-tenant',
  templateUrl: './add-tenant.component.html',
  styleUrl: './add-tenant.component.scss'
})
export class AddTenantComponent implements OnInit {
  private pendingHttpService = inject(PendingHttpService);

  fb = new FormGroup({
    flat: new FormControl<IUIDropdownOption | undefined>(undefined),
    leaseStart: new FormControl<Date | null>(null),
    leaseEnd: new FormControl<Date | null>(null),
    rentAmount: new FormControl<number | null>(null),
  });
  userSearchFormControl = new FormControl<IUser | null>(null);
  contactSearchFormControl = new FormControl<IPhoneContactFlat | null>(null);
  radioFormControl = new FormControl<string>('user');

  radioConfig!: IUIControlConfig;
  flatSearchConfig!: IUIControlConfig;
  leaseStartConfig!: any;
  leaseEndConfig!: any;
  rentAmountConfig!: any;

  societyId?: string;
  flatId?: string;

  flatMembers: IFlatMember[] = [];
  flatOptions: IUIDropdownOption[] = [];
  radioOptions: IUIDropdownOption[] = [];


  get showUserSearch(): boolean {
    return this.radioFormControl.value === 'user' ? true : false;
  }

  get userAsSelectedUser(): ISelectedUser | undefined {
    return !this.userSearchFormControl.value
      ? undefined
      : {
        name: this.userSearchFormControl.value.name,
        phoneNumber: this.userSearchFormControl.value.phoneNumber,
        _id: this.userSearchFormControl.value._id
      } as ISelectedUser
  }

  get showContactSearch(): boolean {
    return this.radioFormControl.value === 'contact' ? true : false;
  }

  get phoneContactAsSelectedUser(): ISelectedUser | undefined {
    return !this.contactSearchFormControl.value
      ? undefined
      : {
        name: this.contactSearchFormControl.value.name,
        phoneNumber: this.contactSearchFormControl.value.phoneNumber,
      } as ISelectedUser
  }

  get selectedUser(): ISelectedUser | undefined {
    return this.showUserSearch
      ? this.userAsSelectedUser
      : this.phoneContactAsSelectedUser
  }

  constructor(
    private location: Location,
    public societyService: SocietyService,
    private newUserService: NewUserService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) { }

  initFormConfigs() {
    this.radioConfig = {
      id: 'radio',
      label: this.translate.instant('JOIN_AS.SEARCH_BY') || 'Search By',
      placeholder: this.translate.instant('JOIN_AS.SEARCH_BY') || 'Search By',
      validations: [
        { name: 'required', validator: Validators.required },
      ],
      errorMessages: {
        required: this.translate.instant('JOIN_AS.SEARCH_BY_REQUIRED') || 'Search By is required'
      }
    };

    this.flatSearchConfig = {
      id: 'flat',
      label: this.translate.instant('PARKINGS.FLAT') || 'Flat',
      placeholder: this.translate.instant('PARKINGS.SELECT_FLAT') || 'Select Flat',
      validations: [
        {
          name: 'required',
          validator: Validators.required
        }
      ],
      errorMessages: {
        required: this.translate.instant('PARKINGS.FLAT_REQUIRED') || 'Select any flat'
      }
    };

    this.leaseStartConfig = {
      id: 'leaseStart',
      label: this.translate.instant('TENANT.LEASE_START') || 'Lease Start',
      placeholder: this.translate.instant('TENANT.ENTER_LEASE_START') || 'Enter Lease Start',
      validations: [
        {
          name: 'required',
          validator: Validators.required
        }
      ],
      errorMessages: {
        required: this.translate.instant('TENANT.LEASE_START_REQUIRED') || 'Lease start date is required'
      }
    };

    this.leaseEndConfig = {
      id: 'leaseEnd',
      label: this.translate.instant('TENANT.LEASE_END') || 'Lease End',
      placeholder: this.translate.instant('TENANT.ENTER_LEASE_END') || 'Enter Lease End'
    };

    this.rentAmountConfig = {
      id: 'rentAmount',
      label: this.translate.instant('TENANT.RENT_AMOUNT') || 'Rent Amount',
      placeholder: this.translate.instant('TENANT.ENTER_RENT_AMOUNT') || 'Enter Rent Amount'
    };

    this.radioOptions = [
      { label: this.translate.instant('JOIN_AS.BY_APP_USER') || 'By App User', value: 'user' },
      { label: this.translate.instant('JOIN_AS.BY_CONTACT') || 'By Contact', value: 'contact' }
    ];
  }

  ngOnInit(): void {
    this.initFormConfigs();
    this.translate.onLangChange.subscribe(() => {
      this.initFormConfigs();
    });

    const societyId = this.societyService.selectedSocietyFilterValue?.value;
    this.societyId = this.route.snapshot.paramMap.get('societyId') ?? societyId;
    this.flatId = this.route.snapshot.paramMap.get('flatId') ?? undefined;
    this.loadAllMyFlats(this.societyId);
  }

  loadAllMyFlats(societyId?: string) {

    this.societyService.myFlats(societyId)
      .pipe(take(1))
      .subscribe(response => {
        if (!response.success) return;

        this.flatMembers = response.data;
        this.flatOptions = response.data.map(flatMember => this.societyService.convertFlatMemberToDropdownOption(flatMember));
        if (this.flatOptions.length > 0) {
          if (this.flatId) {
            const flat = this.flatOptions.find(f => f.value === this.flatId);
            if (flat) {
              this.fb.get('flat')?.setValue(flat);
              this.fb.get('flat')?.disable();
            }
          } else
            this.fb.get('flat')?.setValue(this.flatOptions[0]);
        }
      });
  }

  checkIfResidingStatusNeedsToChange(leaseStart?: Date | null, leaseEnd?: Date | null) {
    if (!leaseStart) return false;

    const today = new Date().getTime();
    if (today > new Date(leaseStart).getTime() && (!leaseEnd || today < new Date(leaseEnd).getTime())) return true;

    return false;
  }

  async save() {
    if (this.fb.invalid || !this.selectedUser) return;

    const formValue = this.fb.value;
    const selectedFlat = this.flatMembers.find(fm => {
      return (typeof fm.flatId === 'string' ? fm.flatId : fm.flatId._id) === formValue.flat?.value
    });
    if (!selectedFlat) return;

    const flat = typeof selectedFlat.flatId === 'string' ? null : selectedFlat.flatId;
    const isMultiTenantAllowed = flat?.isMultiTenantAllowed || false;

    if (!isMultiTenantAllowed && this.checkIfResidingStatusNeedsToChange(formValue.leaseStart, formValue.leaseEnd)) {
      if (!await this.dialogService.confirmToProceed(this.translate.instant('TENANT.ADD_CONFIRM_VACATE') || 'You are adding a tenant with a lease start date of today or earlier – if the flat is currently occupied (by an owner or another tenant), the existing occupant(s) will be automatically vacated to make room for the new tenant; do you want to proceed?')) {
        return;
      }
    }

    const payload = {
      societyId: typeof selectedFlat.societyId === 'string' ? selectedFlat.societyId : selectedFlat.societyId._id,
      flatId: formValue.flat?.value,
      userId: this.selectedUser._id,
      name: this.selectedUser.name ?? 'No Name',
      contact: this.selectedUser.phoneNumber,
      residingType: ResidingTypes.Tenant,
      isTenant: true,
      leaseStart: formValue.leaseStart,
      leaseEnd: formValue.leaseEnd,
      rentAmount: formValue.rentAmount
    };
    this.pendingHttpService.addRequest('add-tenant', { message: 'Tenant Added' });
    this.newUserService.newFlatMember(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.pendingHttpService.removeRequest('add-tenant');
          if (!response.success || !response.token) return;

          this.location.back();
        },
        error: err => {
          this.pendingHttpService.removeRequest('add-tenant');
        }
      });
  }

  cancel() {
    this.location.back();
  }
}
