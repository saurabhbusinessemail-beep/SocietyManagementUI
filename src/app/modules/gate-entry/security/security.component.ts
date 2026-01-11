import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { SocietyService } from '../../../services/society.service';
import { Subject, take, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { QRScannerComponent } from '../qrscanner/qrscanner.component';
import { OTPPopupComponent } from '../../../core/otppopup/otppopup.component';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss'
})
export class SecurityComponent implements OnInit, OnDestroy {

  isComponentActive = new Subject<void>();

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
    label: 'Visitor Name'
  };
  visitorContactConfig: IUIControlConfig = {
    id: 'visitorContact',
    label: 'Visitor Contact'
  };
  vehicleNumberConfig: IUIControlConfig = {
    id: 'vehicleNumber',
    label: 'Vehicle Number'
  };
  purposeConfig: IUIControlConfig = {
    id: 'purpose',
    label: 'Purpose'
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

  get isFlatSelected() {
    return !!this.entryForm.get('flat')?.value
  }

  constructor(
    private societyService: SocietyService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.subscribeToSocietyChange();
    this.loadSocities();
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

          if (this.societyOptions.length > 0) {
            this.entryForm.get('society')?.setValue(this.societyOptions[0])
          }
        },
        error: () => console.log('Error while getting socities')
      });
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

  scanQRCode() {
    this.dialog.open(QRScannerComponent).afterClosed()
      .pipe(take(1))
      .subscribe(response => {
        if (!response) return;
      })
  }

  enterOTP() {
    this.dialog.open(OTPPopupComponent).afterClosed()
      .pipe(take(1))
      .subscribe(response => {
        if (!response) return;
      })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }

}
