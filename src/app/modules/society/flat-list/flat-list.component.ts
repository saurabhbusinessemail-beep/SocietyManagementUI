import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { IBuilding, IFlat, ISociety, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { FlatTypeList, FlatTypes, PERMISSIONS } from '../../../constants';
import { LoginService } from '../../../services/login.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogService } from '../../../services/dialog.service';
import { WindowService } from '../../../services/window.service';

@Component({
  selector: 'app-flat-list',
  templateUrl: './flat-list.component.html',
  styleUrl: './flat-list.component.scss'
})
export class FlatListComponent implements OnInit, OnDestroy {

  societyId?: string;
  buildingId?: string;
  society?: ISociety;
  buildings: IBuilding[] = [];
  building?: IBuilding;
  flats: IFlat[] = [];

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
  floorFilterConfig: IUIControlConfig = {
    id: 'floor',
    label: 'Floor',
    placeholder: 'Select Floor',
  };
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
  addFlatTabsConfig: IUIControlConfig = {
    id: 'settingsTab',
    label: ''
  };
  flatNumberConfig = {
    id: 'flatNumber',
    label: 'Flat Number',
    placeholder: 'Enter Flat Number',
    validations: [
      { name: 'required', validator: Validators.required },
    ],
    errorMessages: {
      required: 'Flat Number is required',
    }
  };
  floorConfig = {
    id: 'floor',
    label: 'Floor',
    placeholder: 'Enter To Floor',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'min', validator: Validators.min(1) }
    ],
    errorMessages: {
      required: 'Floors is required',
      min: 'Floor cannot be less than 1'
    }
  };
  fromFloorConfig = {
    id: 'fromFloor',
    label: 'From Floors',
    placeholder: 'Enter From Floor',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'min', validator: Validators.min(1) }
    ],
    errorMessages: {
      required: 'Floors count is required',
      min: 'Minimum 1 floor is required'
    }
  };
  toFloorConfig = {
    id: 'toFloor',
    label: 'To Floors',
    placeholder: 'Enter To Floors',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'min', validator: Validators.min(1) }
    ],
    errorMessages: {
      required: 'Floors count is required',
      min: 'Minimum 1 floor is required'
    }
  };
  startFlatConfig = {
    id: 'startFlat',
    label: 'Start Flat Number',
    placeholder: 'Enter Start flat unmber',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'min', validator: Validators.min(1) }
    ],
    errorMessages: {
      required: 'Start Flat Number is required',
      min: 'Start Flat Number cannot be less than 1'
    }
  };
  endFlatConfig = {
    id: 'endFlat',
    label: 'End Flat Number',
    placeholder: 'Enter End flat unmber',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'min', validator: Validators.min(1) }
    ],
    errorMessages: {
      required: 'End Flat Number is required',
      min: 'End Flat Number cannot be less than 1'
    }
  };
  flatTypeSelectorConfig: IUIControlConfig = {
    id: 'flatType',
    label: 'Flat Type',
    placeholder: 'Select Flat Type',
    validations: [
      { name: 'required', validator: Validators.required },
    ],
    errorMessages: {
      required: 'Flat Number is required',
    }
  };
  appendFloorNumberConfig: IUIControlConfig = {
    id: 'appendFloorNumber',
    label: 'Append Floor Number',
  };

  selectedTab = 'addFlat';
  tabsOptions: IUIDropdownOption[] = [
    {
      value: 'addFlat',
      label: 'Add Flat'
    },
    {
      value: 'autoGen',
      label: 'Autogenerate Flats'
    },
  ];
  appendFloorNumberOptions: IUIDropdownOption[] = [
    { label: 'Append Floor Number with Flat Number ?', value: true }
  ];
  defaultFilter: IUIDropdownOption = {
    label: 'All',
    value: ''
  }

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

  get pageTitle(): string | undefined {
    if (!this.society) return 'Flats';

    return 'Flats: ' + this.society.societyName
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

  constructor(
    private route: ActivatedRoute,
    private societyService: SocietyService,
    private loginService: LoginService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private windowService: WindowService
  ) { }

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

  subscribeToChange() {
    this.fb.get('society')?.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(society => {
        this.buildings = [];
        this.fb.get('building')?.reset();
        this.flats = [];
        this.fb.get('building')?.enable();
        if (!society) return;

        if (society.numberOfBuildings > 1) {
          this.loadSocietyBuildings(society._id);
        }
        else {
          this.loadFlats(society._id);
          setTimeout(() => {
            this.fb.get('building')?.disable();
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
      }, [] as any[]);

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

    if (!await this.dialogService.confirmDelete('Delete Flat', `Are you sure you want to delete flat ${flat.flatNumber} ?`)) return;

    this.societyService.deleteFlat(this.societyId, flat._id)
      .pipe(take(1))
      .subscribe({
        next: (value) => {
          const buildingId = typeof flat.buildingId === 'string' ? flat.buildingId : flat.buildingId?._id;
          this.loadFlats(this.societyId ?? '', buildingId ?? undefined);
        },
      })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
