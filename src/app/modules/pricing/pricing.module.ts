import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PricingRoutingModule } from './pricing-routing.module';
import { PricingCheckoutComponent } from './pricing-checkout/pricing-checkout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from "../../core/layout/layout.module";


@NgModule({
  declarations: [
    PricingCheckoutComponent
  ],
  imports: [
    CommonModule,
    PricingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule
]
})
export class PricingModule { }
