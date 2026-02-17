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


@Component({
  selector: 'app-society-managers',
  templateUrl: './society-managers.component.html',
  styleUrl: './society-managers.component.scss'
})
export class SocietyManagersComponent extends ListBase implements OnDestroy {

  societyId?: string;
  society?: ISociety;

  managers: IUser[] = [];
  
  @ViewChild('managerTemplate') managerTemplate!: TemplateRef<any>;
  currentDialogRef: MatDialogRef<any> | null = null;

  loading = false;
  isComponentActive = new Subject<void>();

  userSearchFormControl = new FormControl<IUser | null>({ value: null, disabled: false });
  contactSearchFormControl = new FormControl<IPhoneContactFlat | null>(null);
  radioFormControl = new FormControl<string>('user');
  fb = new FormGroup({
    manager: new FormControl<ISelectedUser | null>(null, [Validators.required])
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
    if (!this.society) return 'Managers';

    return 'Managers: ' + this.society.societyName;
  }

  get showUserSearch(): boolean {
    return this.radioFormControl.value === 'user' ? true : false;
  }

  get showContactSearch(): boolean {
    return this.radioFormControl.value === 'contact' ? true : false;
  }

  get canAddSocietyManager(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_adminContact_add, this.society?._id);
  }

  get canDeleteSocietyManager(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_adminContact_delete, this.society?._id);
  }

  constructor(
    private route: ActivatedRoute,
    private societyService: SocietyService,
    private location: Location,
    private loginService: LoginService,
    private router: Router,
    dialogService: DialogService,
    private windowService: WindowService,
    private dialog: MatDialog,
  ) { super(dialogService) }

  ngOnInit(): void {
    this.societyId = this.route.snapshot.paramMap.get('id')!;
    if (!this.societyId) this.router.navigateByUrl('');

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

    if (!await this.dialogService.confirmDelete('Delete Manager', `Are you sure you want to delete manager ${user.name}?`)) return;

    this.societyService.deleteManager(this.societyId, user._id)
      .pipe(take(1))
      .subscribe(() => {
        this.loadSocietyManagers(this.societyId ?? '');
      });
  }

  deleteOneRecord(id: string) {
    if (!this.societyId) return;

    return this.societyService.deleteManager(this.societyId, id);
  }

  refreshList() {
    if (!this.societyId) return;

    this.loadSocietyManagers(this.societyId);
  }

  cancel() {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
