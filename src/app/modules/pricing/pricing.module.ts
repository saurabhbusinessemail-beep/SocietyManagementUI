import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PricingRoutingModule } from './pricing-routing.module';
import { PricingCheckoutComponent } from './pricing-checkout/pricing-checkout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from "../../core/layout/layout.module";
import { PricingListComponent } from './pricing-list/pricing-list.component';
import { PricingDetailModule } from '../../core/pricing/pricing.module';


@NgModule({
  declarations: [
    PricingCheckoutComponent,
    PricingListComponent
  ],
  imports: [
    CommonModule,
    PricingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    PricingDetailModule
]
})
export class PricingModule { }
