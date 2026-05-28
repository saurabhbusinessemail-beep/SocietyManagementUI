import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IMyProfile, IUIControlConfig, IUIDropdownOption, UILocationResult } from '../../../interfaces';
import { countries } from '../../../constants';
import { forkJoin, Subject, take, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { LoginService } from '../../../services/login.service';
import { PendingHttpService } from '../../../services/pending-http.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-society',
  templateUrl: './add-society.component.html',
  styleUrl: './add-society.component.scss'
})
export class AddSocietyComponent implements OnInit, OnDestroy {

  private pendingHttpService = inject(PendingHttpService);

  fb = new FormGroup({
    societyId: new FormControl<string>(''),
    societyName: new FormControl<string>(''),
    gpsLocation: new FormControl<UILocationResult | undefined>(undefined),
    numberOfBuildings: new FormControl<number>(1),
    numberOfFlats: new FormControl<number>(1),
  });

  myProfile?: IMyProfile;

  isMultipleBuildings = new FormControl<boolean[]>([]);
  multiBuildingConfig!: IUIControlConfig;
  multiBuildingOptions!: IUIDropdownOption[];

  isComponentActive = new Subject<void>();

  countryList: IUIDropdownOption[] = countries.map(c => ({ label: c.countryName, value: c.countryCode }));

  locationSearchConfig!: IUIControlConfig;
  societyNameConfig!: any;
  buildingCountConfig!: any;
  flatCountConfig!: any;

  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private societyService: SocietyService,
    private location: Location,
    public loginService: LoginService,
    private translate: TranslateService
  ) { }

  initFormConfigs() {
    this.multiBuildingConfig = {
      id: 'isMultipleBuildings',
      label: this.translate.instant('SOCIETY.MORE_THAN_ONE_BUILDING') || 'More than 1 building?',
      helpText: this.translate.instant('SOCIETY.HELP_MULTIPLE_BUILDINGS') || 'Check this if this society has multiple buildings.'
    };

    this.multiBuildingOptions = [
      { label: this.translate.instant('SOCIETY.YES') || 'Yes', value: true },
    ];

    this.locationSearchConfig = {
      id: 'location',
      label: this.translate.instant('SOCIETY.LOCATION') || 'Location',
      placeholder: this.translate.instant('SOCIETY.SEARCH_LOCATION') || 'Search Location',
      validations: [
        { name: 'required', validator: Validators.required },
      ],
      errorMessages: {
        required: this.translate.instant('SOCIETY.LOCATION_REQUIRED') || 'Location is required'
      }
    };

    this.societyNameConfig = {
      id: 'societyName',
      label: this.translate.instant('SOCIETY.SOCIETY_NAME') || 'Society Name',
      placeholder: this.translate.instant('SOCIETY.ENTER_SOCIETY_NAME') || 'Enter Society Name',
      validations: [
        { name: 'required', validator: Validators.required },
        { name: 'minlength', validator: Validators.minLength(3) }
      ],
      errorMessages: {
        required: this.translate.instant('SOCIETY.SOCIETY_NAME_REQUIRED') || 'Society Name is required',
        minlength: this.translate.instant('SOCIETY.MIN_3_CHARS') || 'Minimum 3 characters required'
      }
    };

    this.buildingCountConfig = {
      id: 'numberOfBuildings',
      label: this.translate.instant('SOCIETY.BUILDINGS_COUNT') || 'Buildings Count',
      placeholder: this.translate.instant('SOCIETY.ENTER_BUILDINGS_COUNT') || 'Enter Count Of Buildings',
      validations: [
        { name: 'required', validator: Validators.required },
        { name: 'min', validator: Validators.min(2) }
      ],
      errorMessages: {
        required: this.translate.instant('SOCIETY.BUILDINGS_COUNT_REQUIRED') || 'Building count is required',
        min: this.translate.instant('SOCIETY.MIN_VAL_2') || 'Value cannot be less than 2.'
      }
    };

    this.flatCountConfig = {
      id: 'numberOfFlats',
      label: this.translate.instant('SOCIETY.FLATS_COUNT') || 'Flats Count',
      placeholder: this.translate.instant('SOCIETY.ENTER_FLATS_COUNT') || 'Enter Count Of Flats',
      validations: [
        { name: 'required', validator: Validators.required },
        { name: 'min', validator: Validators.min(1) }
      ],
      errorMessages: {
        required: this.translate.instant('SOCIETY.FLATS_COUNT_REQUIRED') || 'Flat count is required',
        min: this.translate.instant('SOCIETY.MIN_VAL_1') || 'Value cannot be less than 1.'
      }
    };
  }

  ngOnInit() {
    this.initFormConfigs();
    this.translate.onLangChange.pipe(takeUntil(this.isComponentActive)).subscribe(() => {
      this.initFormConfigs();
    });

    this.myProfile = this.loginService.getProfileFromStorage();

    this.isMultipleBuildings.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(isMultiArr => {
        const isMulti = isMultiArr && isMultiArr.length > 0 ? isMultiArr[0] : false;
        this.updateBuildingControl(isMulti)
      });

    this.fb.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(val => this.errorMessage = '');
    this.updateBuildingControl(false);

    const id = this.route.snapshot.paramMap.get('societyId');
    if (id) {
      this.fb.get('societyId')?.setValue(id);
      this.loadSocietyDetails(id);
    }
  }

  updateBuildingControl(isMulti: boolean | null) {
    const numberOfBuildingsControl = this.fb.get('numberOfBuildings')
    if (isMulti) {
      numberOfBuildingsControl?.enable();
    } else {
      numberOfBuildingsControl?.disable();
    }
  }

  loadSocietyDetails(id: string) {
    forkJoin({
      society: this.societyService.getSociety(id).pipe(take(1)),
      buildingsCount: this.societyService.getBuildingsCount(id).pipe(take(1)),
      flatsCount: this.societyService.getFlatsCount(id).pipe(take(1))
    }).subscribe({
      next: ({ society, buildingsCount, flatsCount }) => {
        this.fb.patchValue(society);
        this.fb.get('gpsLocation')?.setValue(society.gpsLocation)
        if (society.numberOfBuildings > 1) {
          this.isMultipleBuildings.setValue([true])
        }

        const bCount = buildingsCount.data ?? 0;
        const fCount = flatsCount.data ?? 0;

        if (bCount > 0 || fCount > 0) {
          this.isMultipleBuildings.disable();
          this.multiBuildingConfig.helpText = 'This option cannot be changed as buildings or flats have already been added for this society.';
        }
      },
      error: err => console.log('Loading society details failed')
    })
  }

  cancel() {
    this.location.back();
  }

  save() {
    if (this.fb.invalid) {
      return;
    }

    let payload = this.fb.value;
    if (!payload) return;

    if (!payload.numberOfBuildings) {
      payload['numberOfBuildings'] = 1;
    }

    if (this.fb.value.societyId) {
      this.edit(payload);
    } else {

      if (this.myProfile && this.myProfile.user.role === 'user')
        this.createSocietyForApproval(payload);
      else if (!this.myProfile || this.myProfile.user.role === 'user')
        this.loginAndSendForApproval(payload);
      else
        this.add(payload);
    }

  }

  async loginAndSendForApproval(payload: any) {
    this.loginService.loginAndReturn()
      .pipe(take(1))
      .subscribe(() => {
        this.createSocietyForApproval(payload)
      })
  }

  createSocietyForApproval(payload: any) {
    this.pendingHttpService.addRequest('request-society', { message: 'Request sent to society admin for approval.' });
    this.societyService.createSocietyForApproval(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.pendingHttpService.removeRequest('request-society');
          this.router.navigateByUrl('/society/pendingApproval/societies');
        },
        error: err => {
          this.pendingHttpService.removeRequest('request-society');
          this.errorMessage = 'Error while sending society for approval.';
          console.log('error while adding society');
        }
      })
  }

  add(payload: any) {

    this.societyService.createSociety(payload)
      .pipe(take(1))
      .subscribe({
        next: response => this.location.back(), // this.router.navigateByUrl('/society'),
        error: err => {
          this.errorMessage = 'Error while adding society';
          console.log('error while adding society');
        }
      })
  }

  edit(payload: any) {

    const id = this.fb.value.societyId ?? '';
    this.societyService.updateSociety(id, payload)
      .pipe(take(1))
      .subscribe({
        next: response => this.location.back(), // this.router.navigateByUrl('/society'),
        error: err => {
          this.errorMessage = 'Error while adding society';
          console.log('error while adding society');
        }
      })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
