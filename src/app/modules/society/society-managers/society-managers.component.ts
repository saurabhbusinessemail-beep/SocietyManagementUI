import { Component, OnDestroy } from '@angular/core';
import { IPhoneContactFlat, ISociety, IUIControlConfig, IUIDropdownOption, IUser } from '../../../interfaces';
import { ActivatedRoute } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { Subject, take, takeUntil } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { LoginService } from '../../../services/login.service';
import { PERMISSIONS } from '../../../constants';

interface IManager {
  _id?: string;
  name: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-society-managers',
  templateUrl: './society-managers.component.html',
  styleUrl: './society-managers.component.scss'
})
export class SocietyManagersComponent implements OnDestroy {

  societyId?: string;
  society?: ISociety;

  managers: IUser[] = [];

  loading = false;
  isComponentActive = new Subject<void>();

  userSearchFormControl = new FormControl<IUser | null>({ value: null, disabled: false });
  contactSearchFormControl = new FormControl<IPhoneContactFlat | null>(null);
  radioFormControl = new FormControl<string>('user');
  fb = new FormGroup({
    manager: new FormControl<IManager | null>(null, [Validators.required])
  });
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
  radioOptions: IUIDropdownOption[] = [
    { label: 'By App User', value: 'user' },
    { label: 'By Contact', value: 'contact' }
  ];

  get managerName(): string {
    return (this.society ? this.society.societyName : '') + ' Managers';
  }

  get showUserSearch(): boolean {
    return this.radioFormControl.value === 'user' ? true : false;
  }

  get showContactSearch(): boolean {
    return this.radioFormControl.value === 'contact' ? true : false;
  }

  get canAddSocietyManager(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_adminContact_add, 'id', this.society?._id);
  }

  get canDeleteSocietyManager(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_adminContact_delete, 'id', this.society?._id);
  }

  constructor(
    private route: ActivatedRoute,
    private societyService: SocietyService,
    private location: Location,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.societyId = this.route.snapshot.paramMap.get('id')!;
    this.loadSocietyManagers(this.societyId);
    this.subscribeToRadioChange();
  }

  resetAll() {
    this.fb.reset();
    this.userSearchFormControl.reset();
    this.contactSearchFormControl.reset();
  }

  subscribeToRadioChange() {
    this.radioFormControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(value => {
        this.resetAll();
      });

    this.userSearchFormControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(user => {
        this.fb.reset();
        if (!user) return;

        console.log('user = ', user)
        this.fb.patchValue({
          manager: {
            name: user.name ?? 'No Name',
            phoneNumber: user.phoneNumber,
            _id: user._id
          }
        });
      })

    this.contactSearchFormControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(contact => {
        this.fb.reset();
        if (!contact) return;

        this.fb.patchValue({
          manager: {
            name: contact.name, phoneNumber: contact.phoneNumber
          }
        });
      })
  }

  loadSocietyManagers(societyId: string) {
    this.loading = true;

    this.societyService.getSociety(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.society = response;

          if (
            this.society.managerIds &&
            typeof this.society.managerIds[0] === 'string'
          ) {
            // this.secretaries = await this.userService.getUsersByIds(
            //   this.society.secreataryIds as string[]
            // );
          } else {
            this.managers = this.society.managerIds as IUser[];
          }

          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  addSecretary() {
    if (this.fb.invalid || !this.societyId) return;

    this.societyService.newManager(this.societyId, this.fb.value.manager)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response.success) this.loadSocietyManagers(this.societyId ?? '');
        }
      });
  }

  async removeSecretary(user: IUser) {
    if (!this.societyId) return;

    this.societyService.deleteManager(this.societyId, user._id)
      .pipe(take(1))
      .subscribe(() => {
        this.loadSocietyManagers(this.societyId ?? '');
      });
  }

  cancel() {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
