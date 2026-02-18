import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil, Observable } from 'rxjs';
import { FlatTypes, FlatTypeList, PERMISSIONS, VehicleTypes, VehicleTypeList } from '../../../constants';
import { ISociety, IBuilding, IFlat, IUIControlConfig, IUIDropdownOption, IParking } from '../../../interfaces';
import { LoginService } from '../../../services/login.service';
import { SocietyService } from '../../../services/society.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogService } from '../../../services/dialog.service';
import { WindowService } from '../../../services/window.service';
import { ListBase } from '../../../directives/list-base.directive';

@Component({
  selector: 'app-parkings-list',
  templateUrl: './parkings-list.component.html',
  styleUrl: './parkings-list.component.scss'
})
export class ParkingsListComponent extends ListBase implements OnInit, OnDestroy {

  societyId?: string;
  buildingId?: string;
  society?: ISociety;
  buildings: IBuilding[] = [];
  building?: IBuilding;
  flats: IFlat[] = [];
  parkings: IParking[] = [];


  @ViewChild('parkingTemplate') parkingTemplate!: TemplateRef<any>;
  currentDialogRef: MatDialogRef<any> | null = null;

  @ViewChild('target') target!: ElementRef;

  fb = new FormGroup({
    _id: new FormControl<string | undefined>(''),
    society: new FormControl<ISociety | null>(null, [Validators.required]),
    building: new FormControl<string | null>(null, [Validators.required]),
    parkingNumber: new FormControl<string | null>(null, [Validators.required]),
    parkingType: new FormControl<string>('4W', [Validators.required]),
    flatId: new FormControl<string | null>(null, [Validators.required]),
  });

  errorMessage: string = '';
  isComponentActive = new Subject<void>();
  societyNameConfig: IUIControlConfig = {
    id: 'societyName',
    label: 'Society Name'
  };
  buildingSelectorConfig: IUIControlConfig = {
    id: 'building',
    label: 'Building',
    placeholder: 'Select Building',
    validations: [
      { name: 'required', validator: Validators.required },
    ],
    errorMessages: {
      required: 'Building is required',
    }
  };
  parkingTypeSelectorConfig: IUIControlConfig = {
    id: 'parkingType',
    label: 'Parking Type',
    placeholder: 'Select Parking Type',
    validations: [
      { name: 'required', validator: Validators.required },
    ],
    errorMessages: {
      required: 'Parking Type is required',
    }
  };
  flatIdConfig: IUIControlConfig = {
    id: 'flatId',
    label: 'Flat',
    placeholder: 'Select Flat',
    validations: [
      { name: 'required', validator: Validators.required },
    ],
    errorMessages: {
      required: 'Flat is required',
    }
  };
  parkingNumberConfig = {
    id: 'parkingNumber',
    label: 'Parking Number',
    placeholder: 'Enter Parking Number',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'minlength', validator: Validators.minLength(2) }
    ],
    errorMessages: {
      required: 'Parking Number is required',
      minlength: 'Minimum 2 characters required'
    }
  };

  defaultFilter: IUIDropdownOption = {
    label: 'All',
    value: ''
  }

  get selectedParkingId(): string | undefined {
    return this.fb.get('_id')?.value ?? undefined;
  }

  get selectedBuildingId(): string | undefined {
    return this.fb.get('building')?.value ?? undefined;
  }

  get selectedSociety(): ISociety | undefined {
    return this.fb.get('society')?.value ?? undefined;
  }

  get selectedBuilding(): string | undefined {
    return this.fb.get('building')?.value ?? undefined;
  }

  get selectedParkingType(): keyof typeof VehicleTypes | undefined {
    const ctrl = this.fb.get('parkingType');
    return ctrl && ctrl.value ? ctrl.value as keyof typeof VehicleTypes : undefined;
  }

  get pageTitle(): string | undefined {
    if (!this.society) return 'Parkings';

    return 'Parkings: ' + this.society.societyName;
  }

  get buildingOptions(): IUIDropdownOption<string>[] {
    return this.buildings.map(b => {
      return {
        label: b.buildingNumber,
        value: b._id
      } as IUIDropdownOption<string>
    });
  }

  get parkingTypeOptions(): IUIDropdownOption<string>[] {
    return VehicleTypeList.map(vt => ({
      label: vt.name,
      value: vt.vehicleTypeId
    } as IUIDropdownOption))
  }

  get parkingFlatOptions(): IUIDropdownOption<string>[] {
    return this.flats.map(f => ({
      label: f.floor + ':' + f.flatNumber,
      value: f._id
    } as IUIDropdownOption))
  }

  get canAddParking() {
    return this.loginService.hasPermission(PERMISSIONS.parking_add, this.societyId);
  }

  get canUpdateParking() {
    return this.loginService.hasPermission(PERMISSIONS.parking_update, this.societyId);
  }

  get canDeleteParking() {
    return this.loginService.hasPermission(PERMISSIONS.parking_delete, this.societyId);
  }

  constructor(
    private route: ActivatedRoute,
    private societyService: SocietyService,
    private loginService: LoginService,
    private dialog: MatDialog,
    dialogService: DialogService,
    private windowService: WindowService
  ) { super(dialogService) }

  ngOnInit(): void {
    this.societyId = this.route.snapshot.paramMap.get('id')!;
    this.buildingId = this.route.snapshot.paramMap.get('buildingId')!;

    if (this.societyId) {
      this.loadSociety(this.societyId);

      if (this.buildingId) {
        this.loadBuilding(this.societyId, this.buildingId);
      }

    }

    this.subscribeToChange();
  }

  loadSociety(societyId: string) {
    this.societyService.getSociety(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.society = response;
          this.fb.get('society')?.setValue(response);

          if (this.society.numberOfBuildings > 1) {
            this.loadSocietyBuildings(societyId);
            this.fb.get('building')?.enable();
            // this.subscribeToChange();
          } else {
            this.loadFlats(societyId);
            this.loadParkings(societyId);
            this.fb.get('building')?.disable();
          }
        }
      })
  }

  loadSocietyBuildings(societyId: string) {

    this.societyService.getBuildings(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.buildings = response.data;
        }
      })
  }

  loadBuilding(societyId: string, buildingId: string) {
    this.societyService.getBuilding(societyId, buildingId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.building = response;
          this.loadFlats(societyId, buildingId);
          this.loadParkings(societyId, buildingId);
          setTimeout(() => {
            this.fb.get('building')?.setValue(response._id);
            this.fb.get('building')?.disable();
          });
        }
      })
  }

  loadFlats(societyId: string, buildingId?: string) {
    this.societyService.getFlats(societyId, buildingId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.flats = response.data;
        }
      })
  }

  loadParkings(societyId: string, buildingId?: string) {
    this.societyService.getParkings(societyId, buildingId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.parkings = response.data;
        }
      })
  }

  subscribeToChange() {
    this.fb.get('society')?.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(society => {
        this.buildings = [];
        this.fb.get('building')?.reset();
        this.flats = [];
        this.parkings = [];
        this.fb.get('building')?.enable();
        if (!society) return;

        if (society.numberOfBuildings > 1) {
          this.loadSocietyBuildings(society._id);
        }
        else {
          this.loadFlats(society._id);
          this.loadParkings(society._id);
          setTimeout(() => {
            this.fb.get('building')?.disable();
          });
        }
        this.resetParkingForm();
      });

    this.fb.get('building')?.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(buildingId => {
        this.flats = [];
        this.parkings = [];
        if (!buildingId) return;

        const building = this.buildings.find(b => b._id === buildingId);
        if (!building) return;

        const societyId = typeof building.societyId === 'string' ? building.societyId : building.societyId._id;
        this.loadFlats(societyId, building._id);
        this.loadParkings(societyId, building._id);
        this.resetParkingForm();
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
    this.resetParkingForm();
    this.currentDialogRef = this.dialog.open(this.parkingTemplate, {
      width: this.getDialogWidth(),
      panelClass: 'building-form-dialog'
    });
    this.currentDialogRef.afterClosed().subscribe(() => {
      this.currentDialogRef = null;
      this.resetParkingForm();
    });
  }

  openEditDialog(parking: IParking) {
    this.resetParkingForm(parking); // populate form
    this.currentDialogRef = this.dialog.open(this.parkingTemplate, {
      width: '600px',
      panelClass: 'building-form-dialog'
    });
    this.currentDialogRef.afterClosed().subscribe(() => {
      this.currentDialogRef = null;
      this.resetParkingForm();
    });
  }

  closeDialog() {
    this.currentDialogRef?.close();
  }

  addParking() {
    if (this.fb.invalid || !this.societyId) return;

    const formValue = this.fb.value;
    const payload = {
      parkingNumber: formValue.parkingNumber,
      societyId: this.societyId,
      buildingId: formValue.building,
      flatId: formValue.flatId,
      parkingType: formValue.parkingType
    }
    const existingParkings = this.findExistingParkingNumber([payload]);
    if (existingParkings) {
      this.errorMessage = `Parking ${existingParkings} already exists`;
      return;
    }

    this.societyService.newParking(this.societyId, payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.loadParkings(this.societyId ?? '', formValue.building ?? undefined)
          this.closeDialog();
        }
      })
  }

  async generateParking() {
    const parkingType = this.selectedParkingType;
    if (!parkingType) return;

    const parkingTypeName = VehicleTypes[parkingType];

    if(!await this.dialogService.confirmToProceed(`Parkings will be created automatically for all pending flats which do not have ${parkingTypeName} parking yet`)) return;

    // Find flats with pending parkings
    const flatsWithoutParking = this.flats.filter(f => !this.parkings.some(p => p.flatId === f._id && p.parkingType === parkingType));
    if (flatsWithoutParking.length === 0) return;

    const newParkings = flatsWithoutParking.map(f => {
      return {
        parkingNumber: f.floor + f.flatNumber,
        societyId: this.societyId,
        buildingId: f.buildingId,
        flatId: f._id,
        parkingType: '4W'
      };
    });

    const existingParkings = this.findExistingParkingNumber(newParkings);
    if (existingParkings) {
      this.errorMessage = `Parking ${existingParkings} already exists`;
      return;
    }

    this.societyService.newParkings(this.societyId ?? '', newParkings)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.loadParkings(this.societyId ?? '', this.selectedBuilding)
          this.closeDialog();
        }
      })
  }

  updateParking() {
    if (this.fb.invalid || !this.societyId) return;

    const formValue = this.fb.value;

    // check if new parking number already exists
    if (this.parkings.some(p => p._id !== formValue._id && p.parkingNumber === formValue.parkingNumber)) {
      this.errorMessage = 'Parking number already exists';
      return;
    }

    const payload = {
      _id: formValue._id,
      parkingNumber: formValue.parkingNumber,
      societyId: this.societyId,
      buildingId: formValue.building,
      flatId: formValue.flatId,
      parkingType: formValue.parkingType
    }
    this.societyService.updateParking(this.societyId, formValue._id ?? '', payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.loadParkings(this.societyId ?? '', formValue.building ?? undefined);
          this.closeDialog();
        }
      })
  }

  findExistingParkingNumber(parkings: any[]): string {
    return parkings.filter(p => this.parkings.some(sp => sp.parkingNumber === p.parkingNumber))
      .map(p => p.parkingNumber)
      .join(', ');
  }

  async deleteParking(parking: IParking) {
    if (!this.societyId) return;

    if (!await this.dialogService.confirmDelete('Delete Parking', `Are you sure you want to delete Parking ${parking.parkingNumber} ?`)) return;

    this.societyService.deleteParking(this.societyId, parking._id)
      .pipe(take(1))
      .subscribe({
        next: (value) => {
          this.loadParkings(this.societyId ?? '', this.fb.value.building ?? undefined);
        },
      })
  }

  deleteOneRecord(id: string) {
    if (!this.societyId) return;

    return this.societyService.deleteParking(this.societyId, id);
  }

  refreshList() {
    if (!this.societyId) return;

    this.loadParkings(this.societyId, this.selectedBuilding);
  }

  editParking(parking: IParking) {
    this.fb.get('_id')?.setValue(parking._id);
    this.fb.get('parkingNumber')?.setValue(parking.parkingNumber);
    this.fb.get('parkingType')?.setValue(parking.parkingType);
    this.fb.get('flatId')?.setValue(typeof parking.flatId === 'string' ? parking.flatId : (parking.flatId?._id ?? ''))
    this.scrollToElement();
  }

  resetParkingForm(parking?: IParking) {
    const flatId = typeof parking?.flatId === 'string' ? parking.flatId : parking?.flatId?._id;
    this.fb.get('_id')?.setValue(parking?._id);
    this.fb.get('parkingNumber')?.setValue(parking?.parkingNumber ?? null);
    this.fb.get('parkingType')?.setValue(parking?.parkingType ?? '4W');
    this.fb.get('flatId')?.setValue(flatId ?? null);
  }

  scrollToElement() {
    this.target.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  getFlatNumber(parking: IParking) {
    return !parking.flatId || typeof parking.flatId === 'string' ? undefined : (parking.flatId.floor + ':' + parking.flatId.flatNumber)
  }

  getFlatType(parking: IParking) {
    return VehicleTypeList.find(vt => vt.vehicleTypeId === parking.parkingType)?.name
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
