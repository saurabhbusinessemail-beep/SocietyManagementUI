import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { IBuilding, IFlat, ISociety, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { FlatTypeList, FlatTypes, PERMISSIONS } from '../../../constants';
import { LoginService } from '../../../services/login.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogService } from '../../../services/dialog.service';
import { WindowService } from '../../../services/window.service';
import { ListBase } from '../../../directives/list-base.directive';
import { UILabelValueType } from '../../../types';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-flat-list',
  templateUrl: './flat-list.component.html',
  styleUrl: './flat-list.component.scss'
})
export class FlatListComponent extends ListBase implements OnInit, OnDestroy {

  societyId?: string;
  buildingId?: string;
  society?: ISociety;
  buildings: IBuilding[] = [];
  building?: IBuilding;
  flats: IFlat[] = [];

  loadingSociety = false;
  loadingSocietyBuildings = false;
  loadingBuilding = false;
  loadingFlats = false;
  totalFlatsCount = 0;
  loadingTotalFlatsCount = false;

  @ViewChild('flatTemplate') flatTemplate!: TemplateRef<any>;
  currentDialogRef: MatDialogRef<any> | null = null;

  fb = new FormGroup({
    _id: new FormControl<string | undefined>(''),
    society: new FormControl<ISociety | null>(null, [Validators.required]),
    building: new FormControl<string | null>(null, [Validators.required]),
    autogenerateForm: new FormGroup({
      fromFloor: new FormControl<number>(1, [Validators.required]),
      toFloor: new FormControl<number>(1, [Validators.required]),
      startFlat: new FormControl<number>(1, [Validators.required]),
      endFlat: new FormControl<number>(1, [Validators.required]),
      flatType: new FormControl<FlatTypes>(FlatTypes['1BHK'], [Validators.required])
    }),
    addFlats: new FormGroup({
      flatNumber: new FormControl<string | null>(null, [Validators.required]),
      floor: new FormControl<number>(1, [Validators.required]),
      flatType: new FormControl<FlatTypes>(FlatTypes['1BHK'], [Validators.required])
    }),
    appendFloorNumber: new FormControl<boolean[]>([])
  });
  floorControl = new FormControl<string | null>(null);

  isComponentActive = new Subject<void>();
  floorFilterConfig!: IUIControlConfig;
  societyNameConfig!: IUIControlConfig;
  buildingSelectorConfig!: IUIControlConfig;
  addFlatTabsConfig!: IUIControlConfig;
  flatNumberConfig!: any;
  floorConfig!: any;
  fromFloorConfig!: any;
  toFloorConfig!: any;
  startFlatConfig!: any;
  endFlatConfig!: any;
  flatTypeSelectorConfig!: IUIControlConfig;
  appendFloorNumberConfig!: IUIControlConfig;
  pendingFlatssConfig!: IUIControlConfig;

  selectedTab = 'addFlat';
  tabsOptions: IUIDropdownOption[] = [];
  appendFloorNumberOptions: IUIDropdownOption[] = [];
  defaultFilter!: IUIDropdownOption;

  errorMessage: string = '';

  get filterOptions(): IUIDropdownOption[] {
    const floors = this.flats.reduce((floors, flat) => {
      floors.add(flat.floor.toString());
      return floors;
    }, new Set<string>())

    return [
      this.defaultFilter,
      ...Array.from(floors.values()).map(f => ({ label: f, value: f } as IUIDropdownOption))
    ]
  }

  get selectedFlatId(): string | undefined {
    return this.fb.get('_id')?.value ?? undefined;
  }

  get selectedSociety(): ISociety | undefined {
    return this.fb.get('society')?.value ?? undefined;
  }

  get selectedBuilding(): string | undefined {
    return this.fb.get('building')?.value ?? undefined;
  }

  get flatTypeOptions(): IUIDropdownOption<FlatTypes>[] {
    return FlatTypeList.map(ft => {
      return {
        label: ft.toString(),
        value: ft
      } as IUIDropdownOption<FlatTypes>
    });
  }

  get buildingOptions(): IUIDropdownOption<string>[] {
    return this.buildings.map(b => {
      return {
        label: b.buildingNumber,
        value: b._id
      } as IUIDropdownOption<string>
    });
  }

  get canAddFlat() {
    return this.loginService.hasPermission(PERMISSIONS.flat_add, this.societyId);
  }

  get canDeleteFlat() {
    return this.loginService.hasPermission(PERMISSIONS.flat_delete, this.societyId);
  }

  get pendingFlatsToAdd(): number {
    return (this.society?.numberOfFlats ?? 0) - this.totalFlatsCount;
  }

  get pendingBuildingType(): UILabelValueType {
    if (this.pendingFlatsToAdd < 0)
      return 'error';
    else if (this.pendingFlatsToAdd > 0)
      return 'active';
    else
      return 'info'
  }

  constructor(
    private route: ActivatedRoute,
    public societyService: SocietyService,
    private loginService: LoginService,
    private dialog: MatDialog,
    dialogService: DialogService,
    private windowService: WindowService,
    private router: Router,
    private translate: TranslateService
  ) { super(dialogService) }

  initFormConfigs() {
    this.floorFilterConfig = {
      id: 'floor',
      label: this.translate.instant('FLAT.FLOOR') || 'Floor',
      placeholder: this.translate.instant('FLAT.SELECT_FLOOR') || 'Select Floor',
    };
    this.societyNameConfig = {
      id: 'societyName',
      label: this.translate.instant('SOCIETY.SOCIETY_NAME') || 'Society Name'
    };
    this.buildingSelectorConfig = {
      id: 'building',
      label: this.translate.instant('FLAT.BUILDING') || 'Building',
      placeholder: this.translate.instant('FLAT.SELECT_BUILDING') || 'Select Building',
      validations: [
        { name: 'required', validator: Validators.required },
      ],
      errorMessages: {
        required: this.translate.instant('BUILDING_LIST.BUILDING_NUMBER_REQUIRED') || 'Building is required',
      }
    };
    this.addFlatTabsConfig = {
      id: 'settingsTab',
      label: ''
    };
    this.flatNumberConfig = {
      id: 'flatNumber',
      label: this.translate.instant('FLAT.FLAT_NUMBER') || 'Flat Number',
      placeholder: this.translate.instant('FLAT.ENTER_FLOOR') || 'Enter Flat Number',
      validations: [
        { name: 'required', validator: Validators.required },
      ],
      errorMessages: {
        required: this.translate.instant('FLAT.FLAT_NUMBER_REQUIRED') || 'Flat Number is required',
      }
    };
    this.floorConfig = {
      id: 'floor',
      label: this.translate.instant('FLAT.FLOOR') || 'Floor',
      placeholder: this.translate.instant('FLAT.ENTER_FLOOR') || 'Enter Floor',
      validations: [
        { name: 'required', validator: Validators.required },
        { name: 'min', validator: Validators.min(1) }
      ],
      errorMessages: {
        required: this.translate.instant('FLAT.FLOOR_REQUIRED') || 'Floors is required',
        min: this.translate.instant('FLAT.FLOOR_MIN') || 'Floor cannot be less than 1'
      }
    };
    this.fromFloorConfig = {
      id: 'fromFloor',
      label: this.translate.instant('FLAT.FROM_FLOOR') || 'From Floors',
      placeholder: this.translate.instant('FLAT.FROM_FLOOR') || 'Enter From Floor',
      validations: [
        { name: 'required', validator: Validators.required },
        { name: 'min', validator: Validators.min(1) }
      ],
      errorMessages: {
        required: this.translate.instant('FLAT.FROM_FLOOR_REQUIRED') || 'Floors count is required',
        min: this.translate.instant('FLAT.FLOOR_MIN') || 'Minimum 1 floor is required'
      }
    };
    this.toFloorConfig = {
      id: 'toFloor',
      label: this.translate.instant('FLAT.TO_FLOOR') || 'To Floors',
      placeholder: this.translate.instant('FLAT.TO_FLOOR') || 'Enter To Floors',
      validations: [
        { name: 'required', validator: Validators.required },
        { name: 'min', validator: Validators.min(1) }
      ],
      errorMessages: {
        required: this.translate.instant('FLAT.TO_FLOOR_REQUIRED') || 'Floors count is required',
        min: this.translate.instant('FLAT.FLOOR_MIN') || 'Minimum 1 floor is required'
      }
    };
    this.startFlatConfig = {
      id: 'startFlat',
      label: this.translate.instant('FLAT.START_FLAT') || 'Start Flat Number',
      placeholder: this.translate.instant('FLAT.START_FLAT') || 'Enter Start flat number',
      validations: [
        { name: 'required', validator: Validators.required },
        { name: 'min', validator: Validators.min(1) }
      ],
      errorMessages: {
        required: this.translate.instant('FLAT.START_FLAT_REQUIRED') || 'Start Flat Number is required',
        min: this.translate.instant('FLAT.FLOOR_MIN') || 'Start Flat Number cannot be less than 1'
      }
    };
    this.endFlatConfig = {
      id: 'endFlat',
      label: this.translate.instant('FLAT.END_FLAT') || 'End Flat Number',
      placeholder: this.translate.instant('FLAT.END_FLAT') || 'Enter End flat number',
      validations: [
        { name: 'required', validator: Validators.required },
        { name: 'min', validator: Validators.min(1) }
      ],
      errorMessages: {
        required: this.translate.instant('FLAT.END_FLAT_REQUIRED') || 'End Flat Number is required',
        min: this.translate.instant('FLAT.FLOOR_MIN') || 'End Flat Number cannot be less than 1'
      }
    };
    this.flatTypeSelectorConfig = {
      id: 'flatType',
      label: this.translate.instant('FLAT.FLAT_TYPE') || 'Flat Type',
      placeholder: this.translate.instant('FLAT.SELECT_FLAT_TYPE') || 'Select Flat Type',
      validations: [
        { name: 'required', validator: Validators.required },
      ],
      errorMessages: {
        required: this.translate.instant('FLAT.FLAT_TYPE_REQUIRED') || 'Flat Type is required',
      }
    };
    this.appendFloorNumberConfig = {
      id: 'appendFloorNumber',
      label: this.translate.instant('FLAT.APPEND_FLOOR_NUMBER') || 'Append Floor Number',
    };
    this.pendingFlatssConfig = {
      id: 'pendingFlats',
      label: this.translate.instant('FLAT.PENDING_FLATS') || 'Pending Flats To Add'
    };

    this.tabsOptions = [
      {
        value: 'addFlat',
        label: this.translate.instant('FLAT.ADD_FLAT') || 'Add Flat'
      },
      {
        value: 'autoGen',
        label: this.translate.instant('FLAT.AUTOGENERATE_FLATS') || 'Autogenerate Flats'
      },
    ];

    this.appendFloorNumberOptions = [
      { label: this.translate.instant('FLAT.APPEND_FLOOR_CONFIRM') || 'Append Floor Number with Flat Number ?', value: true }
    ];

    this.defaultFilter = {
      label: this.translate.instant('COMMON.ALL') || 'All',
      value: ''
    };
  }

  ngOnInit(): void {
    this.initFormConfigs();
    this.translate.onLangChange.pipe(takeUntil(this.isComponentActive)).subscribe(() => {
      this.initFormConfigs();
    });

    this.subscribeToChange();

    this.societyId = this.route.snapshot.paramMap.get('societyId')!;
    this.buildingId = this.route.snapshot.paramMap.get('buildingId')!;

    if (this.societyId) {
      this.loadSociety(this.societyId);

      this.loadTotalFlatsCount(this.societyId);

      if (this.buildingId) {
        this.loadBuilding(this.societyId, this.buildingId);
      }

    }
  }

  loadSociety(societyId: string) {
    this.loadingSociety = true;
    this.societyService.getSociety(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.society = response;
          this.fb.get('society')?.setValue(response);
          this.loadingSociety = false;
        },
        error: err => {
          this.loadingSociety = false;
        }
      })
  }

  loadSocietyBuildings(societyId: string) {
    this.loadingSocietyBuildings = true;
    this.societyService.getBuildings(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.buildings = response.data;
          if (this.buildings.length > 0) {
            const b = this.buildings[0];
            this.fb.get('building')?.setValue(b._id);
          }
          this.loadingSocietyBuildings = false;
        },
        error: err => {
          this.loadingSocietyBuildings = false;
        }
      })
  }

  loadBuilding(societyId: string, buildingId: string) {
    this.loadingBuilding = true;
    this.societyService.getBuilding(societyId, buildingId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.building = response;
          this.loadFlats(societyId, buildingId);
          setTimeout(() => {
            this.fb.get('building')?.setValue(response._id);
            this.fb.get('building')?.disable();
          });
          this.loadingBuilding = false;
        },
        error: err => {
          this.loadingBuilding = false;
        }
      })
  }

  loadFlats(societyId: string, buildingId?: string) {
    this.loadingFlats = true;
    this.societyService.getFlats(societyId, buildingId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.flats = response.data;
          this.loadingFlats = false;
        },
        error: err => {
          this.loadingFlats = false;
        }
      })
  }

  loadTotalFlatsCount(societyId: string) {
    this.loadingTotalFlatsCount = true;
    this.societyService.getFlatsCount(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.totalFlatsCount = response.data ?? 0;
          this.loadingTotalFlatsCount = false;
        },
        error: err => {
          this.loadingTotalFlatsCount = false;
        }
      })
  }

  subscribeToChange() {
    this.fb.get('society')?.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(society => {
        this.buildings = [];
        this.fb.get('building')?.reset(undefined, { emitEvent: false });
        this.flats = [];
        this.fb.get('building')?.enable({ emitEvent: false });
        if (!society) return;

        if (society.numberOfBuildings > 1) {
          this.loadSocietyBuildings(society._id);
        }
        else {
          this.loadFlats(society._id);
          setTimeout(() => {
            this.fb.get('building')?.disable({ emitEvent: false });
          });
        }
      });

    this.fb.get('building')?.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(buildingId => {
        this.flats = [];
        if (!buildingId) return;

        const building = this.buildings.find(b => b._id === buildingId);
        if (!building) return;

        const societyId = typeof building.societyId === 'string' ? building.societyId : building.societyId._id;
        this.loadFlats(societyId, building._id);
      });

    this.floorControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: response => {

        }
      });
  }

  handleTabChange(tab: string) {
    switch (tab) {
      case 'autoGen':
        this.fb.get('autogenerateForm')?.enable();
        this.fb.get('addFlats')?.disable();
        break;
      case 'addFlat':
        this.fb.get('autogenerateForm')?.disable();
        this.fb.get('addFlats')?.enable();
        break;
    }
  }

  resetFlatForm() {
    this.fb.get('addFlats')?.setValue({ flatNumber: null, floor: 1, flatType: FlatTypes['1BHK'] }, { emitEvent: false });
    this.fb.get('autogenerateForm')?.setValue({ fromFloor: 1, toFloor: 1, startFlat: 1, endFlat: 1, flatType: FlatTypes['1BHK'] }, { emitEvent: false })
    this.fb.get('appendFloorNumber')?.setValue([]);
    this.selectedTab = 'addFlat';
    this.handleTabChange(this.selectedTab);
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
    this.resetFlatForm();
    this.currentDialogRef = this.dialog.open(this.flatTemplate, {
      width: this.getDialogWidth(),
      panelClass: 'building-form-dialog'
    });
    this.currentDialogRef.afterClosed().subscribe(() => {
      this.currentDialogRef = null;
      this.resetFlatForm();
    });
  }

  closeDialog() {
    this.currentDialogRef?.close();
  }

  addFlat() {
    if (this.fb.invalid) return;

    const formValue = this.fb.getRawValue();
    const connectFloorToFlatNumber = formValue.appendFloorNumber && formValue.appendFloorNumber.length > 0 && formValue.appendFloorNumber[0] === true;
    let obs: Observable<any> | undefined;
    if (this.selectedTab === 'addFlat') {
      const payload = {
        flatNumber: (connectFloorToFlatNumber ? formValue.addFlats.floor ?? '' : '') + (formValue.addFlats?.flatNumber ?? ''),
        buildingId: formValue.building,
        societyId: formValue.society?._id ?? '',
        flatType: formValue.addFlats?.flatType,
        floor: formValue.addFlats?.floor,
      };
      const existingFlats = this.findExistingFlat([payload]);
      if (existingFlats) {
        this.errorMessage = `Flat ${existingFlats} already exists`;
        return;
      }
      obs = this.societyService.newFlat(payload.societyId, payload)

    } else if (this.selectedTab === 'autoGen') {
      const autogenerateForm = formValue.autogenerateForm;

      const flatType = autogenerateForm?.flatType ?? FlatTypes['1BHK'];
      const fromFloor = (autogenerateForm?.fromFloor ?? 0) * 1;
      const toFloor = (autogenerateForm?.toFloor ?? 0) * 1;
      const startFlat = (autogenerateForm?.startFlat ?? 0) * 1;
      const endFlat = (autogenerateForm?.endFlat ?? 0) * 1;
      const arrFloors = Array.from({ length: toFloor - fromFloor + 1 }, (_, i) => fromFloor + i);
      const arrFlatNumbers = Array.from({ length: endFlat - startFlat + 1 }, (_, i) => startFlat + i);
      const digitLength = endFlat > 9 ? endFlat.toString().length : 2;

      const flats = arrFloors.reduce((arrFlats, floorNumber) => {
        arrFlatNumbers.forEach(flatNumber => {
          const paddedFlat = flatNumber.toString().padStart(digitLength, '0');

          arrFlats.push({
            flatNumber: (connectFloorToFlatNumber ? floorNumber : '') + paddedFlat,
            flatType,
            floor: floorNumber,
            societyId: formValue.society?._id ?? '',
            buildingId: formValue.building ?? undefined,
          });
        })
        return arrFlats;
      }, [] as Partial<IFlat>[]);

      const existingFlats = this.findExistingFlat(flats);
      if (existingFlats) {
        this.errorMessage = `Flat ${existingFlats} already exists`;
        return;
      }

      obs = this.societyService.newFlats((formValue.society?._id ?? ''), flats);
    }

    if (!obs) return;

    obs.pipe(take(1))
      .subscribe({
        next: response => {
          const societyId = formValue.society?._id ?? '';
          const buildingId = formValue.building ?? undefined;
          this.loadFlats(societyId, buildingId);
          this.loadTotalFlatsCount(societyId);
          this.fb.get('autogenerateForm')?.reset();
          this.fb.get('addFlats')?.reset();
          this.closeDialog();
        }
      });
  }

  findExistingFlat(flats: any[]): string {
    return flats.filter(f => {
      return this.flats.some(sf => sf.flatNumber == f.flatNumber && sf.floor === f.floor)
    })
      .map(f => f.floor + ':' + f.flatNumber)
      .join(', ')
  }

  async deleteFlat(flat: IFlat) {
    if (!this.societyId) return;

    const title = this.translate.instant('FLAT.DELETE_TITLE') || 'Delete Flat';
    const message = this.translate.instant('FLAT.DELETE_CONFIRM', { number: flat.flatNumber }) || `Are you sure you want to delete flat ${flat.flatNumber} ?`;

    if (!await this.dialogService.confirmDelete(title, message)) return;

    this.societyService.deleteFlat(this.societyId, flat._id)
      .pipe(take(1))
      .subscribe({
        next: (value) => {
          const buildingId = typeof flat.buildingId === 'string' ? flat.buildingId : flat.buildingId?._id;
          this.loadFlats(this.societyId ?? '', buildingId ?? undefined);
          this.loadTotalFlatsCount(this.societyId ?? '');
        },
      })
  }

  onFlatClick(flat: IFlat) {
    const idToPass = flat.flatOwnerMemberId || flat._id;
    this.router.navigate(['myflats/details', idToPass]);
  }

  deleteOneRecord(id: string) {
    if (!this.societyId) return;

    return this.societyService.deleteFlat(this.societyId, id);
  }

  refreshList() {
    if (!this.societyId || !this.selectedBuilding) return;

    this.loadFlats(this.societyId, this.selectedBuilding);
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
