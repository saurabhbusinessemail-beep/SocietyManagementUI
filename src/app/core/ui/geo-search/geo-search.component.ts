import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, Self } from '@angular/core';
import { UIBaseFormControl } from '../../../directives';
import { ICountry, IState, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs';
import { FormControl, NgControl, Validators } from '@angular/forms';
import { countries, districts, states } from '../../../constants';

@Component({
  selector: 'ui-geo-search',
  templateUrl: './geo-search.component.html',
  styleUrl: './geo-search.component.scss'
})
export class GeoSearchComponent extends UIBaseFormControl<string | undefined> implements OnInit, OnDestroy {

  @Input() type: 'country' | 'state' | 'district' = 'country';
  @Input() countryCode?: string;
  @Input() stateCode?: string;
  @Output() selectionChange = new EventEmitter<string | undefined>();

  private search$ = new Subject<string>();

  countrySearchConfig: IUIControlConfig = {
    id: 'country',
    label: 'Country',
    placeholder: 'Search Country',
  };
  stateSearchConfig: IUIControlConfig = {
    id: 'state',
    label: 'State',
    placeholder: 'Search State',
  };
  districtSearchConfig: IUIControlConfig = {
    id: 'district',
    label: 'District',
    placeholder: 'Search District',
  };

  coutrySearchControl = new FormControl<string | undefined>(undefined);
  stateSearchControl = new FormControl<string | undefined>(undefined);
  districtSearchControl = new FormControl<string | undefined>(undefined);

  filteredCountry: IUIDropdownOption<string>[] = [];
  filteredState: IUIDropdownOption<string>[] = [];
  filteredDistrict: IUIDropdownOption<string>[] = [];

  get filteredData(): IUIDropdownOption<string>[] {
    switch (this.type) {
      case 'country': return this.filteredCountry;
      case 'state': return this.filteredState;
      case 'district': return this.filteredDistrict;
    }
  }

  get geoControl(): FormControl {
    switch (this.type) {
      case 'country': return this.coutrySearchControl;
      case 'state': return this.stateSearchControl;
      case 'district': return this.districtSearchControl;
    }
  }

  get geoSearchConfig(): IUIControlConfig {
    switch (this.type) {
      case 'country': return this.countrySearchConfig;
      case 'state': return this.stateSearchConfig;
      case 'district': return this.districtSearchConfig;
    }
  }

  set geoSearchConfig(config: IUIControlConfig) {
    switch (this.type) {
      case 'country': this.countrySearchConfig = config; break;
      case 'state': this.stateSearchConfig = config; break;
      case 'district': this.districtSearchConfig = config; break;
    }
  }

  constructor(@Optional() @Self() ngControl: NgControl) {
    super(ngControl);
  }

  ngOnInit(): void {
    if (this.config)
      this.geoSearchConfig = this.config
    this.subscribeToSearchChange();
    this.subscribeToGeoSelection();
  }

  onGeoSearch(searchText: string) {
    this.filteredCountry = [];
    this.filteredState = [];
    this.filteredDistrict = [];
    this.search$.next(searchText);
  }

  subscribeToSearchChange() {
    this.search$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      takeUntil(this.isComponentActive),
    )
      .subscribe({
        next: (searchText: string) => {

          switch (this.type) {
            case 'country':
              this.filteredCountry = this.filterCountries(searchText);
              break;
            case 'state':
              this.filteredState = this.filterStates(searchText);
              break;
            case 'district':
              this.filteredDistrict = this.filterDistricts(searchText);
              break;
          }

        }
      });
  }

  filterCountries(searchText: string): IUIDropdownOption<string>[] {
    return countries.filter(country => {
      const q = searchText.toLowerCase();
      const nameMatch =
        country.countryName.toLowerCase().includes(q) ||
        country.countryName.toLowerCase().includes(q) ||
        country.countryName.toLowerCase().includes(q);

      return !!nameMatch;
    })
      .map(country => {
        return {
          label: country.countryName + ' - ' + country.capital,
          value: country.countryCode,
        }
      });
  }

  filterStates(searchText: string): IUIDropdownOption<string>[] {
    return states.filter(state => {
      if (this.countryCode && state.countryCode !== this.countryCode) return;

      const q = searchText.toLowerCase();
      const nameMatch =
        state.stateName.toLowerCase().includes(q) ||
        state.stateName.toLowerCase().includes(q) ||
        state.stateName.toLowerCase().includes(q);

      return !!nameMatch;
    })
      .map(state => {
        return {
          label: state.stateName + ' - ' + state.stateCode,
          value: state.stateCode,
        }
      });
  }

  filterDistricts(searchText: string): IUIDropdownOption<string>[] {
    return districts.filter(district => {
      if (this.countryCode && district.countryCode !== this.countryCode) return;
      if (this.stateCode && district.stateCode !== this.stateCode) return;

      const q = searchText.toLowerCase();
      const nameMatch =
        district.districtName.toLowerCase().includes(q) ||
        district.districtName.toLowerCase().includes(q) ||
        district.districtName.toLowerCase().includes(q);

      return !!nameMatch;
    })
      .map(district => {
        return {
          label: district.districtName + ' - ' + district.districtCode,
          value: district.districtCode,
        }
      });
  }

  subscribeToGeoSelection() {
    this.geoControl.valueChanges.pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: selectedGeo => {
          this.updateValue(selectedGeo);
        }
      })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
