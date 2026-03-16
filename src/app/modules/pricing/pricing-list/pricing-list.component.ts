import { Component } from '@angular/core';
import { IPricingPlan } from '../../../interfaces';
import { Router } from '@angular/router';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-pricing-list',
  templateUrl: './pricing-list.component.html',
  styleUrl: './pricing-list.component.scss'
})
export class PricingListComponent {

  constructor(private router: Router, public loginService: LoginService) { }

  gotoPricingPlanCheckout(plan: IPricingPlan) {
    // const societyId = 'abcd699055620c4bd294ac82c4bc';
    this.router.navigate(['pricing-plan/checkout', plan._id]);
  }
}
