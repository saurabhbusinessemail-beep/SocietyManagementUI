import { Component, inject, OnInit } from '@angular/core';
import { IFlatMember, IPhoneContactFlat, ISelectedUser, IUIControlConfig, IUIDropdownOption, IUser } from '../../../interfaces';
import { FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { SocietyService } from '../../../services/society.service';
import { NewUserService } from '../../../services/new-user.service';
import { take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PendingHttpService } from '../../../services/pending-http.service';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.scss'
})
export class AddMemberComponent implements OnInit {
  private pendingHttpService = inject(PendingHttpService);

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

  routeSocietyId?: string;
  routeFlatId?: string;

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
    public societyService: SocietyService,
    private newUserService: NewUserService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const societyId = this.societyService.selectedSocietyFilterValue?.value;
    this.routeSocietyId = this.route.snapshot.paramMap.get('id') ?? this.societyService.selectedSocietyFilterValue?.value;
    this.routeFlatId = this.route.snapshot.paramMap.get('flatId') ?? undefined;
    this.loadAllMyFlats(this.routeSocietyId ?? societyId);
  }

  loadAllMyFlats(societyId?: string) {

    this.societyService.myFlats(societyId)
      .pipe(take(1))
      .subscribe(response => {
        if (!response.success) return;

        this.flatMembers = response.data;
        this.flatOptions = response.data.map(flatMember => this.societyService.convertFlatMemberToDropdownOption(flatMember));

        if (this.flatOptions.length > 0) {
          if (this.routeFlatId) {
            const flat = this.flatOptions.find(f => f.value === this.routeFlatId);
            if (flat) {
              this.flatControl?.setValue(flat);
              this.flatControl?.disable();
            }
          } else
            this.flatControl?.setValue(this.flatOptions[0]);
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
    this.pendingHttpService.addRequest('add-member', { message: 'Member Added' });
    this.newUserService.newFlatMember(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.pendingHttpService.removeRequest('add-member');
          if (!response.success || !response.token) return;

          this.location.back();
        },
        error: err => {
          this.pendingHttpService.removeRequest('add-member');
        }
      });
  }

  cancel() {
    this.location.back();
  }
}
