import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationSearchComponent } from './location-search.component';
import { GoogleMapsModule } from '@angular/google-maps';


@NgModule({
  declarations: [
    LocationSearchComponent
  ],
  imports: [
    CommonModule,
    GoogleMapsModule
  ],
  exports: [LocationSearchComponent]
})
export class LocationSearchModule { }
