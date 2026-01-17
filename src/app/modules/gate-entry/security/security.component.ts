import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IConfirmationPopupDataConfig, IFlat, IGateEntry, IGatePass, ISociety, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { SocietyService } from '../../../services/society.service';
import { Subject, take, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { QRScannerComponent } from '../qrscanner/qrscanner.component';
import { OTPPopupComponent } from '../../../core/otppopup/otppopup.component';
import { GatePassService } from '../../../services/gate-pass.service';
import { DialogService } from '../../../services/dialog.service';
import { GateEntryService } from '../../../services/gate-entry.service';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss'
})
export class SecurityComponent implements OnInit, OnDestroy {

  isComponentActive = new Subject<void>();
  pendingApprovals: IGateEntry[] = [];

  societyConfig: IUIControlConfig = {
    id: 'society',
    label: 'Society',
    validations: [
      {
        name: 'required',
        validator: Validators.required
      }
    ],
    errorMessages: {
      required: 'Society selection is required'
    }
  };
  flatConfig: IUIControlConfig = {
    id: 'flat',
    label: 'Flat'
  };
  visitorNameConfig: IUIControlConfig = {
    id: 'visitorName',
    label: 'Visitor Name',
    validations: [
      {
        name: 'required',
        validator: Validators.required
      }
    ],
    errorMessages: {
      required: 'Visitor\'s name is required'
    }
  };
  visitorContactConfig: IUIControlConfig = {
    id: 'visitorContact',
    label: 'Visitor Contact',
    validations: [
      {
        name: 'required',
        validator: Validators.required
      }
    ],
    errorMessages: {
      required: 'Visitor\'s contact is required'
    }
  };
  vehicleNumberConfig: IUIControlConfig = {
    id: 'vehicleNumber',
    label: 'Vehicle Number'
  };
  purposeConfig: IUIControlConfig = {
    id: 'purpose',
    label: 'Purpose'
  };

  otpValidConfig: IConfirmationPopupDataConfig = {
    icon: 'valid',
    message: 'Valid Pass',
    actionButtons: []
  };
  otpInvalidConfig: IConfirmationPopupDataConfig = {
    icon: 'invalid',
    message: 'Invalid Pass',
    actionButtons: []
  };

  tabControl = new FormControl<string>('entry');
  tabsConfig: IUIControlConfig = {
    id: 'tab',
    label: 'Setting Tabs'
  };
  tabsOptions: IUIDropdownOption[] = [
    { value: 'entry', label: 'Entry' },
    { value: 'out', label: 'Exit' },
  ];

  societyOptions: IUIDropdownOption[] = [];
  flatOptions: IUIDropdownOption[] = [];

  entryForm = new FormGroup({
    society: new FormControl<IUIDropdownOption | null>(null),
    flat: new FormControl<IUIDropdownOption | null>(null),

    visitorName: new FormControl<string | null>(null),
    visitorContact: new FormControl<string | null>(null),

    vehicleNumber: new FormControl<string | null>(null),
    purpose: new FormControl<string | null>(null)
  });

  get isSocietySelected() {
    return !!this.entryForm.get('society')?.value
  }

  get isFlatSelected() {
    return !!this.entryForm.get('flat')?.value
  }

  constructor(
    private loginService: LoginService,
    private societyService: SocietyService,
    private gatePassService: GatePassService,
    private gateEntryService: GateEntryService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.subscribeToSocietyChange();
    this.loadSocities();
  }

  getGateEntrySociety(gateEntry: IGateEntry): ISociety | undefined {
    return typeof gateEntry.societyId === 'string' ? undefined : gateEntry.societyId;
  }

  getGateEntryFlat(gateEntry: IGateEntry): IFlat | undefined {
    return typeof gateEntry.flatId === 'string' ? undefined : gateEntry.flatId;
  }

  loadSocities() {
    this.societyService.getAllSocieties()
      .pipe(take(1))
      .subscribe({
        next: response => {
          const societies = response.data ?? [];

          this.societyOptions = societies.map(s => ({
            label: s.societyName,
            value: s._id
          } as IUIDropdownOption));

          this.loadDefaultSociety();
        },
        error: () => console.log('Error while getting socities')
      });
  }

  loadDefaultSociety() {
    if (this.societyOptions.length > 0) {
      this.entryForm.get('society')?.setValue(this.societyOptions[0]);
      this.loadPendingApprovals();
    }
  }

  subscribeToSocietyChange() {
    this.entryForm.get('society')?.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: society => {
          this.flatOptions = [];
          if (!society) return;

          this.loadSocietyFlats(society.value);
        }
      });
  }

  loadSocietyFlats(societyId: string, populate = true) {

    this.societyService.getFlats(societyId)
      .pipe(take(1))
      .subscribe(response => {
        if (!response.success) {
          return;
        }

        this.flatOptions = response.data.map(flat => this.societyService.convertFlatToDropdownOption(flat, this.entryForm.get('society')?.value?.value));
      });

  }

  loadPendingApprovals() {
    const societyId = this.entryForm.get('society')?.value?.value;
    this.gateEntryService.getApprovalPendingGateEntries(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.pendingApprovals = response.data;
        }
      });
  }

  resendNotification(gateEntry: IGateEntry) {
    this.gateEntryService.resendNotification(gateEntry._id)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;
        }
      })
  }

  scanQRCode() {
    this.dialog.open(QRScannerComponent).afterClosed()
      .pipe(take(1))
      .subscribe(response => {
        if (!response) return;

        try {
          const payload = JSON.parse(response);

          if (payload.otp) {
            const { otp, societyId, flatId } = payload;
            this.validateOTPAndCreateGateEntry(otp, societyId, flatId);

          } else if (payload.gatePassId) {
            this.validateGatePass(payload.gatePassId)
          }
        } catch {
          console.log('Error while reading QR code`')
        }
      })
  }

  enterOTP() {
    this.dialog.open(OTPPopupComponent).afterClosed()
      .pipe(take(1))
      .subscribe(response => {
        if (!response) return;

        this.validateOTPAndCreateGateEntry(response);
      })
  }

  validateOTPAndCreateGateEntry(otp: string, sid?: string, flatId?: string) {
    const formValue = this.entryForm.value;
    const societyId = sid ?? formValue.society?.value;
    if (!societyId) return;

    this.gatePassService.validateOTP(otp, societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          const confirmationPopupConfig = response.success ? this.otpValidConfig : this.otpInvalidConfig;
          this.dialogService.showConfirmation(confirmationPopupConfig);

          const data = response.data;
          if (!data) return;

          const payload = this.createPayloadFromGatePass(data);
          this.saveGateEntry(payload);
        }
      });
  }

  validateGatePass(gatePassId: string) {
    this.gatePassService.validateGatePass(gatePassId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          const confirmationPopupConfig = response.success ? this.otpValidConfig : this.otpInvalidConfig;
          this.dialogService.showConfirmation(confirmationPopupConfig);

          const data = response.data;
          if (!data) return;

          const payload = this.createPayloadFromGatePass(data);
          this.saveGateEntry(payload);
        }
      });
  }

  createPayloadFromGatePass(gatePass: IGatePass): any {
    return {
      gatePassId: gatePass._id,
      societyId: typeof gatePass.societyId === 'string' ? gatePass.societyId : gatePass.societyId._id,
      flatId: typeof gatePass.flatId === 'string' ? gatePass.flatId : gatePass.flatId._id,
      visitorName: typeof gatePass.userId === 'string' ? undefined : gatePass.userId.name,
      visitorContact: typeof gatePass.userId === 'string' ? undefined : gatePass.userId.phoneNumber,
      entryTime: new Date(),
      status: 'approved',
      approvedBy: typeof gatePass.userId === 'string' ? gatePass.userId : gatePass.userId._id
    };
  }

  requestApproval() {
    const myProfile = this.loginService.getProfileFromStorage();
    if (!myProfile) return;

    const formValue = this.entryForm.value;
    const payload = {
      societyId: formValue.society?.value,
      flatId: formValue.flat?.value,
      visitorName: formValue.visitorName,
      visitorContact: formValue.visitorContact,
      purpose: formValue.purpose,
      vehicleNumber: formValue.vehicleNumber,
      entryTime: new Date(),
      status: 'requested'
    };

    this.saveGateEntry(payload);
  }

  selfApprove() {
    const myProfile = this.loginService.getProfileFromStorage();
    if (!myProfile) return;

    const formValue = this.entryForm.value;
    const payload = {
      societyId: formValue.society?.value,
      flatId: formValue.flat?.value,
      visitorName: formValue.visitorName,
      visitorContact: formValue.visitorContact,
      purpose: formValue.purpose,
      vehicleNumber: formValue.vehicleNumber,
      entryTime: new Date(),
      status: 'approved',
      approvedBy: myProfile.user._id
    };

    this.saveGateEntry(payload);
  }

  saveGateEntry(payload: any) {
    this.gateEntryService.newGateEntry(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success || !response.data) return;

          this.entryForm.reset();
          this.loadDefaultSociety();
        },
        error: (err) => {
          this.loadDefaultSociety();
        },
      })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }

}
