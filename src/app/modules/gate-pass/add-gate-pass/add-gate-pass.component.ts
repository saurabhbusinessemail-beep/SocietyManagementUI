import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { IBEResponseFormat, IFlatMember, IPhoneContactFlat, ISelectedUser, IUIControlConfig, IUIDropdownOption, IUser } from '../../../interfaces';
import { SocietyService } from '../../../services/society.service';
import { Observable, forkJoin, take } from 'rxjs';
import { GatePassService } from '../../../services/gate-pass.service';
import { Router } from '@angular/router';

function minArrayLength(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    return Array.isArray(value) && value.length >= min
      ? null
      : { minArrayLength: { required: min } };
  };
}

@Component({
  selector: 'app-add-gate-pass',
  templateUrl: './add-gate-pass.component.html',
  styleUrl: './add-gate-pass.component.scss'
})
export class AddGatePassComponent implements OnInit {

  fb = new FormGroup({
    flat: new FormControl<IUIDropdownOption | undefined>(undefined),
    expectedDate: new FormControl<Date | undefined>(new Date()),
    users: new FormControl<ISelectedUser[]>([], minArrayLength(1)),
    remarks: new FormControl<string | undefined>(''),
  });
  userSearchFormControl = new FormControl<IUser | null>({ value: null, disabled: false });
  contactSearchFormControl = new FormControl<IPhoneContactFlat | null>(null);
  radioFormControl = new FormControl<string>('user');

  flatMembers: IFlatMember[] = [];
  flatOptions: IUIDropdownOption[] = [];
  radioOptions: IUIDropdownOption[] = [
    { label: 'By App User', value: 'user' },
    { label: 'By Contact', value: 'contact' }
  ];

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
  expectedDateConfig: IUIControlConfig = {
    id: 'expectedDate',
    label: 'Expected Date',
    placeholder: 'Date of arrrival',
    validations: [
      {
        name: 'required',
        validator: Validators.required
      }
    ],
    errorMessages: {
      required: 'Select expected date'
    }
  };

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

  get getUsers(): ISelectedUser[] {
    return this.fb.get('users')?.value ?? [] as ISelectedUser[];
  }

  constructor(
    private societyService: SocietyService,
    private gatePassService: GatePassService,
    private router: Router
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

  resetManagerSearch() {
    this.userSearchFormControl.reset();
    this.contactSearchFormControl.reset();
    const radioValue = this.radioFormControl.value;
    this.radioFormControl.reset();
    setTimeout(() => {
      this.radioFormControl.setValue(radioValue);
    });
  }

  addUser() {
    if (!this.selectedUser) return;

    this.fb.patchValue({
      users: [...(this.fb.value.users ?? []), this.selectedUser]
    });
    this.resetManagerSearch();
  }

  removeUser(index: number) {
    this.fb.patchValue({
      users: (this.fb.value.users ?? []).filter((u, idx) => idx !== index)
    });
  }

  saveGatePass() {
    if (this.fb.invalid) return;


    const formValue = this.fb.value;
    const selectedFlat = this.flatMembers.find(fm => {
      return (typeof fm.flatId === 'string' ? fm.flatId : fm.flatId._id) === formValue.flat?.value
    })
    if (!selectedFlat) return;

    const obsArr: Observable<IBEResponseFormat>[] = [];

    (formValue.users ?? []).forEach(u => {
      const payload = {
        societyId: typeof selectedFlat.societyId === 'string' ? selectedFlat.societyId : selectedFlat.societyId._id,
        flatId: formValue.flat?.value,
        expectedDate: formValue.expectedDate,
        userId: u._id ?? u,
        remarks: formValue.remarks
      };
      obsArr.push(this.gatePassService.newGatePass(payload));
    });


    forkJoin(obsArr)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/gatepass/list')
        }
      })
  }
}
