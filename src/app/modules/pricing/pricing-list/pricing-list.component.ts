import { Component, OnInit } from '@angular/core';
import { IPricingPlan } from '../../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-pricing-list',
  templateUrl: './pricing-list.component.html',
  styleUrl: './pricing-list.component.scss'
})
export class PricingListComponent implements OnInit {

  societyId: string = '';

  constructor(
    private router: Router,
    public loginService: LoginService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.societyId = params['societyId'];
    });
  }

  gotoPricingPlanCheckout(plan: IPricingPlan) {
    if (!this.societyId)
      this.router.navigate(['pricing-plan/checkout', plan.id]);
    else
      this.router.navigate(['pricing-plan/checkout', plan.id, this.societyId]);
  }
}
