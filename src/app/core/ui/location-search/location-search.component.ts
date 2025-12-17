import { Component, ElementRef, EventEmitter, Input, OnInit, Optional, Output, Self, ViewChild } from '@angular/core';
import { LocationSearchService } from './location-search.service';
import { UILocationResult } from '../../../interfaces';
import { UIBaseFormControl } from '../../../directives';
import { NgControl } from '@angular/forms';

declare const google: any;

@Component({
  selector: 'ui-location-search',
  templateUrl: './location-search.component.html',
  styleUrl: './location-search.component.scss'
})
export class LocationSearchComponent extends UIBaseFormControl<UILocationResult | undefined> implements OnInit {

  @ViewChild('locationInput', { static: true })
  locationInput!: ElementRef<HTMLInputElement>;

  @Output()
  locationSelect = new EventEmitter<UILocationResult>();

  private autocomplete!: google.maps.places.Autocomplete;

  constructor(private mapsLoader: LocationSearchService, @Optional() @Self() ngControl: NgControl) {
    super(ngControl)
  }

  async ngOnInit(): Promise<void> {
    await this.mapsLoader.load();

    this.autocomplete = new google.maps.places.Autocomplete(
      this.locationInput.nativeElement,
      {
        types: ['geocode'],
        fields: ['place_id', 'formatted_address', 'geometry']
      }
    );

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (!place.geometry) return;

      const value = place.formatted_address ?? '';
      // this.value = place.formatted_address ?? '';
      this.locationInput.nativeElement.value = value;

      const location: UILocationResult = {
        address: value,
        lat: place.geometry.location!.lat(),
        lng: place.geometry.location!.lng(),
        placeId: place.place_id ?? undefined,
        source: 'search'
      }
      this.locationSelect.emit(location);
      this.updateValue(location);
    });
  }

  clear(): void {
    this.updateValue(undefined);
    this.locationInput.nativeElement.value = '';
  }

  useCurrentLocation(): void {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: string | any[]) => {
        if (!results?.length) return;

        const value = results[0].formatted_address;
        this.locationInput.nativeElement.value = value;


        const location: UILocationResult = {
          address: value,
          lat,
          lng,
          source: 'current'
        }
        this.locationSelect.emit(location);
        this.updateValue(location);
      });
    });
  }
}
