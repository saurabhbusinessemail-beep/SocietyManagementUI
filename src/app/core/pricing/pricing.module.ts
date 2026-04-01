import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingDetailsComponent } from './pricing-details/pricing-details.component';
import { PipeModule } from "../../pipes/pipes.module";



@NgModule({
  declarations: [
    PricingDetailsComponent
  ],
  imports: [
    CommonModule,
    PipeModule
],
  exports: [PricingDetailsComponent]
})
export class PricingDetailModule { }
