import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ListBase } from '../../../directives/list-base.directive';
import { BehaviorSubject, debounceTime, filter, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from '../../../services/dialog.service';
import { IUIControlConfig, IUIDropdownOption, IVehicle } from '../../../interfaces';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WindowService } from '../../../services/window.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DropDownControl } from '../../../types';
import { VehicleTypeList } from '../../../constants';
import { VehicleService } from '../../../services/vehicle.service';
import { SocietyService } from '../../../services/society.service';
import { TranslateService } from '@ngx-translate/core';

interface IVehicleFilter {
  flatId?: string
}

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss'
})
export class VehicleListComponent extends ListBase implements OnInit, OnDestroy {

  flatId?: string;
  vehicles: IVehicle[] = [];
  isFlatMember: boolean = false;


  loadingVehicles = true;
  savingVehicle = false;
  loadingVehicleAction: { [memberId: string]: boolean } = {};

  isComponentActive = new Subject<void>();
  selectedFilterChanged = new BehaviorSubject<IVehicleFilter>({});

  societyControl = new FormControl<DropDownControl>(undefined, [Validators.required]);
  flatControl = new FormControl<DropDownControl>(undefined);

  societiesSearchConfig!: IUIControlConfig<DropDownControl>;
  flatSearchConfig!: IUIControlConfig<DropDownControl>;
  vehicleNumberConfig!: any;
  vehicleTypeConfig!: IUIControlConfig;

  fb = new FormGroup({
    flat: this.flatControl,
    vehicleNumber: new FormControl<string | null>(null),
    vehicleType: new FormControl<'4W' | null>(null, Validators.required),
  });

  @ViewChild('vehicleTemplate') vehicleTemplate!: TemplateRef<any>;
  currentDialogRef: MatDialogRef<any> | null = null;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    dialogService: DialogService,
    private windowService: WindowService,
    private vehicleService: VehicleService,
    public societyService: SocietyService,
    private translate: TranslateService
  ) {
    super(dialogService);
  }

  initFormConfigs() {
    this.societiesSearchConfig = {
      id: 'societyId',
      label: this.translate.instant('SOCIETY.TITLE') || 'Society',
      placeholder: 'Search Society',
      formControl: this.societyControl,
      dropDownOptions: []
    };

    this.flatSearchConfig = {
      id: 'flatId',
      label: this.translate.instant('PARKINGS.FLAT') || 'Flat',
      placeholder: this.translate.instant('PARKINGS.SELECT_FLAT') || 'Search Flat',
      formControl: this.flatControl,
      dropDownOptions: [],
      validations: this.flatId ? [] : [
        { name: 'required', validator: Validators.required }
      ],
      errorMessages: {
        required: 'Flat is required'
      }
    };

    this.vehicleNumberConfig = {
      id: 'vehicleNumber',
      label: this.translate.instant('VEHICLES.VEHICLE_NUMBER') || 'Vehicle Number',
      placeholder: this.translate.instant('VEHICLES.ENTER_VEHICLE_NUMBER') || 'Enter Vehicle Number',
      validations: [
        { name: 'required', validator: Validators.required },
        { name: 'minlength', validator: Validators.minLength(9) }
      ],
      errorMessages: {
        required: this.translate.instant('VEHICLES.VEHICLE_NUMBER_REQUIRED') || 'Vehicle Number is required',
        minlength: this.translate.instant('VEHICLES.VEHICLE_NUMBER_MIN') || 'Vehicle Number cannot be less than 9 numbers'
      }
    };

    this.vehicleTypeConfig = {
      id: 'vehicleType',
      label: this.translate.instant('VEHICLES.VEHICLE_TYPE') || 'Vehicle Type',
      placeholder: this.translate.instant('VEHICLES.SELECT_VEHICLE_TYPE') || 'Select Vehicle Type',
      validations: [
        { name: 'required', validator: Validators.required },
      ],
      errorMessages: {
        required: this.translate.instant('VEHICLES.VEHICLE_TYPE_REQUIRED') || 'Vehicle Type is required',
      },
      dropDownOptions: VehicleTypeList.map(vt => ({
        label: this.translate.instant('VEHICLES.TYPE_' + vt.vehicleTypeId) || vt.name,
        value: vt.vehicleTypeId
      } as IUIDropdownOption))
    };
  }

  ngOnInit() {
    this.flatId = this.route.snapshot.paramMap.get('flatId')!;
    this.initFormConfigs();
    this.translate.onLangChange.pipe(takeUntil(this.isComponentActive)).subscribe(() => {
      this.initFormConfigs();
    });

    this.subscribeToFilterChanged();
  }
  handleFilterChange(selectedFilter: IVehicleFilter) {
    this.selectedFilterChanged.next(selectedFilter);
  }

  subscribeToFilterChanged() {
    this.selectedFilterChanged
      .pipe(
        takeUntil(this.isComponentActive),
        debounceTime(300),
        tap(selectedFilter => {
          this.vehicles = [];
        }),
        filter(selectedFilter => !!selectedFilter.flatId || !!this.flatId), // Only proceed when flatId exists
        switchMap(selectedFilter => {
          this.loadingVehicles = true;
          return this.vehicleService.getVehicles(selectedFilter.flatId ?? this.flatId ?? '');
        })
      )
      .subscribe({
        next: response => {
          this.loadingVehicles = false;
          if (response?.success) {
            this.vehicles = response.data ?? [];
          }
        },
        error: err => {
          this.loadingVehicles = false;
          // Optionally handle error (e.g., show toast)
        }
      });
  }

  deleteOneRecord(id: string) {
    return this.vehicleService.deleteVehicle(id);
  }

  refreshList() {
    this.selectedFilterChanged.next(this.selectedFilterChanged.value);
  }

  resetVehicleForm() {
    this.fb.get('vehicleNumber')?.reset();
    this.fb.get('vehicleType')?.reset();
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
    this.resetVehicleForm();
    this.currentDialogRef = this.dialog.open(this.vehicleTemplate, {
      width: this.getDialogWidth(),
      panelClass: 'building-form-dialog'
    });
    this.currentDialogRef.afterClosed().subscribe(() => {
      this.currentDialogRef = null;
      this.resetVehicleForm();
    });
  }

  saveVehicle() {
    if (this.fb.invalid) return;

    const formValue = this.fb.value;
    const payload = {
      flatId: this.flatId ?? formValue.flat?.value,
      vehicleNumber: formValue.vehicleNumber,
      vehicleType: formValue.vehicleType
    }
    this.savingVehicle = true;
    this.vehicleService.createVehicle(payload.flatId, payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.savingVehicle = false;
          if (!response.success) return;

          this.refreshList();
          this.closeDialog();
        },
        error: err => {
          this.savingVehicle = false;
        }
      })
  }

  async deleteVehicle(vehicle: IVehicle) {
    const title = this.translate.instant('VEHICLES.DELETE_TITLE') || 'Delete Vehicle';
    const message = this.translate.instant('VEHICLES.DELETE_CONFIRM', { number: vehicle.vehicleNumber }) || `Are you sure you want to delete vehicle ${vehicle.vehicleNumber} ?`;

    if (!await this.dialogService.confirmDelete(title, message)) return;

    this.loadingVehicleAction[vehicle._id] = true;
    this.deleteOneRecord(vehicle._id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadingVehicleAction[vehicle._id] = false;
          this.refreshList();
        },
        error: err =>
          this.loadingVehicleAction[vehicle._id] = false
      })
  }

  closeDialog() {
    this.currentDialogRef?.close();
  }

  ngOnDestroy() {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
