import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UILocationResult } from '../../interfaces';
import { LocationSearchService } from './location-search.service';

declare const google: any;

@Component({
  selector: 'app-location-search',
  templateUrl: './location-search.component.html',
  styleUrl: './location-search.component.scss'
})
export class LocationSearchComponent implements OnInit {

  @Input() placeholder = 'Search location';
  @Input() disabled = false;

  @ViewChild('locationInput', { static: true })
  locationInput!: ElementRef<HTMLInputElement>;

  @Output()
  locationSelect = new EventEmitter<UILocationResult>();

  value = '';
  private autocomplete!: google.maps.places.Autocomplete;

  constructor(private mapsLoader: LocationSearchService) {}

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

      this.value = place.formatted_address ?? '';

      this.locationSelect.emit({
        address: this.value,
        lat: place.geometry.location!.lat(),
        lng: place.geometry.location!.lng(),
        placeId: place.place_id ?? undefined,
        source: 'search'
      });
    });
  }

  clear(): void {
    this.value = '';
    this.locationInput.nativeElement.value = '';
  }

  useCurrentLocation(): void {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: string | any[]) => {
        if (!results?.length) return;

        this.value = results[0].formatted_address;
        this.locationInput.nativeElement.value = this.value;

        this.locationSelect.emit({
          address: this.value,
          lat,
          lng,
          source: 'current'
        });
      });
    });
  }
}
