import { Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { ISelectedUser, IPhoneContactFlat, ISociety, IUIControlConfig, IUIDropdownOption, IUser } from '../../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { Subject, take, takeUntil } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { LoginService } from '../../../services/login.service';
import { PERMISSIONS } from '../../../constants';
import { DialogService } from '../../../services/dialog.service';
import { ListBase } from '../../../directives/list-base.directive';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WindowService } from '../../../services/window.service';
import { NewUserService } from '../../../services/new-user.service';


@Component({
  selector: 'app-society-securities',
  templateUrl: './society-securities.component.html',
  styleUrl: './society-securities.component.scss'
})
export class SocietySecuritiesComponent extends ListBase implements OnDestroy {

  societyId?: string;

  securities: IUser[] = [];

  @ViewChild('managerTemplate') managerTemplate!: TemplateRef<any>;
  currentDialogRef: MatDialogRef<any> | null = null;

  loading = false;
  isComponentActive = new Subject<void>();

  userSearchFormControl = new FormControl<IUser | null>({ value: null, disabled: false });
  contactSearchFormControl = new FormControl<IPhoneContactFlat | null>(null);
  radioFormControl = new FormControl<string>('user');
  fb = new FormGroup({
    security: new FormControl<ISelectedUser | null>(null, [Validators.required]),
    jobStart: new FormControl<Date | null>(null, [Validators.required]),
    jobEnd: new FormControl<Date | null>(null),
    salaryAmount: new FormControl<number | null>(null),
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

  get jobStartFormControl() {
    return this.fb.get('jobStart') as FormControl<Date | null>;
  }

  get jobEndFormControl() {
    return this.fb.get('jobEnd') as FormControl<Date | null>;
  }

  get salaryFormControl() {
    return this.fb.get('salaryAmount') as FormControl<number | null>;
  }

  get showUserSearch(): boolean {
    return this.radioFormControl.value === 'user' ? true : false;
  }

  get showContactSearch(): boolean {
    return this.radioFormControl.value === 'contact' ? true : false;
  }

  get canAddSocietyManager(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_update, this.societyId);
  }

  get canDeleteSocietyManager(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_update, this.societyId);
  }

  constructor(
    private route: ActivatedRoute,
    public societyService: SocietyService,
    private location: Location,
    private loginService: LoginService,
    private router: Router,
    dialogService: DialogService,
    private windowService: WindowService,
    private dialog: MatDialog,
    private newUserService: NewUserService,
  ) { super(dialogService) }

  ngOnInit(): void {
    this.societyId = this.route.snapshot.paramMap.get('societyId')!;
    if (!this.societyId) this.router.navigateByUrl('');

    this.loadSocietySecurities(this.societyId);
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

        this.fb.patchValue({
          security: {
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
          security: {
            name: contact.name, phoneNumber: contact.phoneNumber
          }
        });
      })
  }

  loadSocietySecurities(societyId: string) {
    this.loading = true;

    this.societyService.getSocietySecurities(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.loading = false;

          if (!response.success || !response.data) return;

          this.securities = response.data.reduce((arr, security) => {
            if (typeof security.userId !== 'string') {
              arr.push(security.userId);
            }
            return arr;
          }, [] as IUser[])
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  getDialogWidth(): string {
    let width = '50%';
    switch (this.windowService.mode.value) {
      case 'mobile': width = '90%'; break;
      case 'tablet': width = '70%'; break;
      case 'desktop': width = '60%'; break
    }
    return width;
  }
  openAddDialog() {
    // this.resetParkingForm();
    this.currentDialogRef = this.dialog.open(this.managerTemplate, {
      width: this.getDialogWidth(),
      panelClass: 'building-form-dialog'
    });
    this.currentDialogRef.afterClosed().subscribe(() => {
      this.currentDialogRef = null;
      // this.resetParkingForm();
      this.refreshList();
    });
  }

  closeDialog() {
    this.currentDialogRef?.close();
  }

  private generateSecurityPayload(): any {
    const formValue = this.fb.getRawValue();
    const profile = this.loginService.getProfileFromStorage();
    if (!this.societyId || !profile) return null;

    const selectedUser = this.showUserSearch
      ? { userId: this.userSearchFormControl.value?._id, name: this.userSearchFormControl.value?.name, contact: this.userSearchFormControl.value?.phoneNumber }
      : { userId: undefined, name: this.contactSearchFormControl.value?.name, contact: this.contactSearchFormControl.value?.phoneNumber };

    return {
      societyId: this.societyId,
      ...selectedUser,
      jobStart: formValue.jobStart,
      jobEnd: formValue.jobEnd,
      salaryAmount: formValue.salaryAmount
    };
  }

  addecurity() {
    if (this.fb.invalid || !this.societyId) return;

    const payload = this.generateSecurityPayload();
    if (!payload) return;

    this.newUserService.newSecurity(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response.success) this.closeDialog();
        }
      });
  }

  async removeSecurity(user: IUser) {
    if (!this.societyId) return;

    if (!await this.dialogService.confirmDelete('Delete Security', `Are you sure you want to delete security ${user.name}?`)) return;

    this.societyService.deleteSocietySecurity(this.societyId, user._id)
      .pipe(take(1))
      .subscribe(() => {
        this.loadSocietySecurities(this.societyId ?? '');
      });
  }

  deleteOneRecord(id: string) {
    if (!this.societyId) return;

    return this.societyService.deleteManager(this.societyId, id);
  }

  refreshList() {
    if (!this.societyId) return;

    this.loadSocietySecurities(this.societyId);
  }

  cancel() {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
