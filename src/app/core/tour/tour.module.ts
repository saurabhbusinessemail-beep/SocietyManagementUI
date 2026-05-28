// tour.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourOverlayComponent } from './tour-overlay/tour-overlay.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [TourOverlayComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [TourOverlayComponent]
})
export class TourModule { }
