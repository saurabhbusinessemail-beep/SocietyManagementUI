import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IFlatMember, IPhoneContactFlat, ISelectedUser, IUIControlConfig, IUIDropdownOption, IUser } from '../../../interfaces';
import { SocietyService } from '../../../services/society.service';
import { take } from 'rxjs';
import { ResidingTypes } from '../../../constants';
import { NewUserService } from '../../../services/new-user.service';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-add-tenant',
  templateUrl: './add-tenant.component.html',
  styleUrl: './add-tenant.component.scss'
})
export class AddTenantComponent implements OnInit {

  fb = new FormGroup({
    flat: new FormControl<IUIDropdownOption | undefined>(undefined),
    leaseStart: new FormControl<Date | null>(null),
    leaseEnd: new FormControl<Date | null>(null),
    rentAmount: new FormControl<number | null>(null),
  });
  userSearchFormControl = new FormControl<IUser | null>(null);
  contactSearchFormControl = new FormControl<IPhoneContactFlat | null>(null);
  radioFormControl = new FormControl<string>('user');

  radioConfig: IUIControlConfig = {
    id: 'radio',
    label: 'Search',
    placeholder: 'Search By',
    validations: [
      { name: 'required', validator: Validators.required },
    ],
    errorMessages: {
      required: 'Radio is required'
    }
  };
  flatSearchConfig: IUIControlConfig = {
    id: 'flat',
    label: 'Flat',
    placeholder: 'Select Flat',
    validations: [
      {
        name: 'required',
        validator: Validators.required
      }
    ],
    errorMessages: {
      required: 'Select any flat'
    }
  };
  leaseStartConfig = {
    id: 'leaseStart',
    label: 'Lease Start',
    placeholder: 'Enter Lease Start',
    validations: [
      {
        name: 'required',
        validator: Validators.required
      }
    ],
    errorMessages: {
      required: 'Lease start date is required'
    }
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

  flatMembers: IFlatMember[] = [];
  flatOptions: IUIDropdownOption[] = [];
  radioOptions: IUIDropdownOption[] = [
    { label: 'By App User', value: 'user' },
    { label: 'By Contact', value: 'contact' }
  ];


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
    private societyService: SocietyService,
    private newUserService: NewUserService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.loadAllMyFlats();
  }

  loadAllMyFlats(societyId?: string) {

    this.societyService.myFlats(societyId)
      .pipe(take(1))
      .subscribe(response => {
        if (!response.success) return;

        this.flatMembers = response.data;
        this.flatOptions = response.data.map(flatMember => this.societyService.convertFlatMemberToDropdownOption(flatMember));
        if (this.flatOptions.length > 0) {
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

    if (this.checkIfResidingStatusNeedsToChange(formValue.leaseStart, formValue.leaseEnd)) {
      if (!await this.dialogService.confirmToProceed('You are adding a tenant with a lease start date of today or earlier – if the flat is currently occupied (by an owner or another tenant), the existing occupant(s) will be automatically vacated to make room for the new tenant; do you want to proceed?')) {
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
    this.newUserService.newFlatMember(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success || !response.token) return;

          this.location.back();
        }
      });
  }

  cancel() {
    this.location.back();
  }
}
