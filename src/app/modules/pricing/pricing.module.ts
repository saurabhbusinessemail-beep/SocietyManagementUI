import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PricingRoutingModule } from './pricing-routing.module';
import { PricingCheckoutComponent } from './pricing-checkout/pricing-checkout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from "../../core/layout/layout.module";
import { PricingListComponent } from './pricing-list/pricing-list.component';
import { PricingDetailModule } from '../../core/pricing/pricing.module';
import { UiModule } from '../../core/ui/ui.module';
import { PipeModule } from "../../pipes/pipes.module";


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
    PricingDetailModule,
    UiModule,
    PipeModule
]
})
export class PricingModule { }
