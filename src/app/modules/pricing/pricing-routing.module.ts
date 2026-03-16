import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PricingCheckoutComponent } from './pricing-checkout/pricing-checkout.component';

const routes: Routes = [
  // {
  //   path: '',
  //   pathMatch: 'full',
  //   redirectTo: 'ckeckout/:societyId'
  // },
  {
    path: 'checkout/:planId',
    component: PricingCheckoutComponent
  },
  {
    path: 'checkout/:planId/:societyId',
    component: PricingCheckoutComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PricingRoutingModule { }
