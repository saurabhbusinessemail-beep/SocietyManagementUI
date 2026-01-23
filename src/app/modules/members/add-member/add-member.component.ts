import { Component, OnInit } from '@angular/core';
import { IFlatMember, IPhoneContactFlat, ISelectedUser, IUIControlConfig, IUIDropdownOption, IUser } from '../../../interfaces';
import { FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { SocietyService } from '../../../services/society.service';
import { NewUserService } from '../../../services/new-user.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.scss'
})
export class AddMemberComponent implements OnInit {

  flatControl = new FormControl<IUIDropdownOption | undefined>(undefined);
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
    private newUserService: NewUserService
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
          this.flatControl.setValue(this.flatOptions[0]);
        }
      });
  }

  save() {
    if (this.flatControl.invalid || !this.selectedUser) return;

    const selectedFlat = this.flatMembers.find(fm => {
      return (typeof fm.flatId === 'string' ? fm.flatId : fm.flatId._id) === this.flatControl.value?.value
    });
    if (!selectedFlat) return;

    const payload = {
      societyId: typeof selectedFlat.societyId === 'string' ? selectedFlat.societyId : selectedFlat.societyId._id,
      flatId: this.flatControl.value?.value,
      userId: this.selectedUser._id,
      name: this.selectedUser.name ?? 'No Name',
      contact: this.selectedUser.phoneNumber,
      isMember: selectedFlat.isOwner ? true : false,
      isTenantMember: selectedFlat.isTenant ? true : false
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
