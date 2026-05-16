// tour.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourOverlayComponent } from './tour-overlay/tour-overlay.component';

@NgModule({
  declarations: [TourOverlayComponent],
  imports: [
    CommonModule
  ],
  exports: [TourOverlayComponent]
})
export class TourModule { }
