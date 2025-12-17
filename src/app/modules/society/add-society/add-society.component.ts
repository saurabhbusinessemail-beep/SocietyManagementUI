import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ISociety, IUIControlConfig, IUIDropdownOption, UILocationResult } from '../../../interfaces';
import { countries } from '../../../constants';
import { Subject, take, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';

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

  constructor(private router: Router, private societyService: SocietyService) { }

  ngOnInit() {
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
  }

  updateBuildingControl(isMulti: boolean | null) {
    const numberOfBuildingsControl = this.fb.get('numberOfBuildings')
    if (isMulti) {
      numberOfBuildingsControl?.enable();
    } else {
      numberOfBuildingsControl?.disable();
    }
  }

  cancel() {
    this.router.navigateByUrl('/society');
  }

  save() {
    if (this.fb.invalid) {
      return;
    }

    const payload = this.fb.value;
    if (!payload) return;

    this.societyService.createSociety(payload)
      .pipe(take(1))
      .subscribe({
        next: response => this.router.navigateByUrl('/society'),
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
