import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingDetailsComponent } from './pricing-details/pricing-details.component';



@NgModule({
  declarations: [
    PricingDetailsComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [PricingDetailsComponent]
})
export class PricingDetailModule { }
