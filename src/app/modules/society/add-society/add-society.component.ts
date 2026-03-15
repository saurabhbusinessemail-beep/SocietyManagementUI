import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IMyProfile, IUIControlConfig, IUIDropdownOption, UILocationResult } from '../../../interfaces';
import { countries } from '../../../constants';
import { Subject, take, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-add-society',
  templateUrl: './add-society.component.html',
  styleUrl: './add-society.component.scss'
})
export class AddSocietyComponent implements OnInit, OnDestroy {

  fb = new FormGroup({
    societyId: new FormControl<string>(''),
    societyName: new FormControl<string>(''),
    gpsLocation: new FormControl<UILocationResult | undefined>(undefined),
    numberOfBuildings: new FormControl<number>(1),
  });

  myProfile?: IMyProfile;

  isMultipleBuildings = new FormControl<boolean[]>([]);
  multiBuildingConfig: IUIControlConfig = {
    id: 'isMultipleBuildings',
    label: 'More than 1 building?',
    helpText: 'Check this if this society has multiple buildings.'
  };
  multiBuildingOptions: IUIDropdownOption[] = [
    { label: 'Yes', value: true },
  ];

  isComponentActive = new Subject<void>();

  countryList: IUIDropdownOption[] = countries.map(c => ({ label: c.countryName, value: c.countryCode }));

  locationSearchConfig: IUIControlConfig = {
    id: 'location',
    label: 'Location',
    placeholder: 'Search Location',
    validations: [
      { name: 'required', validator: Validators.required },
    ],
    errorMessages: {
      required: 'Location is required'
    }
  };
  societyNameConfig = {
    id: 'societyName',
    label: 'Society Name',
    placeholder: 'Enter Society Name',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'minlength', validator: Validators.minLength(3) }
    ],
    errorMessages: {
      required: 'Society Name is required',
      minlength: 'Minimum 3 characters required'
    }
  };
  buildingCountConfig = {
    id: 'numberOfBuildings',
    label: 'Number Of Buildings',
    placeholder: 'Enter Count Of Buildings',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'min', validator: Validators.min(2) }
    ],
    errorMessages: {
      required: 'Society Name is required',
      min: 'Value cannot be less than 2.'
    }
  };

  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private societyService: SocietyService,
    private location: Location,
    public loginService: LoginService,
  ) { }

  ngOnInit() {
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

    const id = this.route.snapshot.paramMap.get('id');
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
    this.societyService.getSociety(id)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.fb.patchValue(response);
          this.fb.get('gpsLocation')?.setValue(response.gpsLocation)
          if (response.numberOfBuildings > 1) {
            this.isMultipleBuildings.setValue([true])
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

      if (!this.myProfile || this.myProfile.user.role === 'user')
        this.loginAndSendForApproval(payload);
      else
        this.add(payload);
    }

  }

  async loginAndSendForApproval(payload: any) {
    this.loginService.loginAndReturn()
      .pipe(take(1))
      .subscribe(() => {
        this.societyService.createSocietyForApproval(payload)
          .pipe(take(1))
          .subscribe({
            next: response => this.location.back(),
            error: err => {
              this.errorMessage = 'Error while sending society for approval.';
              console.log('error while adding society');
            }
          })
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
