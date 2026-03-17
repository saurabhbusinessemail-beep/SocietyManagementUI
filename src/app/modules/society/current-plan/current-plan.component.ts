import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISociety, IMyProfile, ICurrentPlanResponse } from '../../../interfaces';
import { LoginService } from '../../../services/login.service';
import { SocietyService } from '../../../services/society.service';
import { PricingPlanService } from '../../../services/pricing-plan.service';

// Extended interface for the API response

@Component({
  selector: 'app-current-plan',
  templateUrl: './current-plan.component.html',
  styleUrls: ['./current-plan.component.scss']
})
export class CurrentPlanComponent implements OnInit {
  societyId: string = '';
  societyDetails?: ISociety;
  currentPlan?: ICurrentPlanResponse;
  isLoading = true;
  error: string | null = null;
  myProfile?: IMyProfile;

  get purchaseByName(): string | undefined {
    return this.currentPlan && typeof this.currentPlan.purchasedBy !== 'string' ? this.currentPlan.purchasedBy?.name : ''
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planService: PricingPlanService,
    private societyService: SocietyService,
    public loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();

    this.route.params.subscribe(params => {
      this.societyId = params['societyId'];
      this.loadData();
    });
  }

  loadData(): void {
    this.isLoading = true;

    // Get society details
    this.societyService.getSociety(this.societyId).subscribe({
      next: (society) => {
        this.societyDetails = society;
      },
      error: (err) => {
        console.error('Error loading society:', err);
      }
    });

    // Get current plan
    this.planService.getCurrentPlan(this.societyId).subscribe({
      next: (response: any) => {
        this.currentPlan = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load current plan';
        this.isLoading = false;
      }
    });
  }

  changePlan(): void {
    this.router.navigate(['/pricing-plan/list', this.societyId]);
  }

  viewHistory(): void {
    this.router.navigate(['society/plan-history', this.societyId]);
  }

  getProgressWidth(): string {
    if (!this.currentPlan?.usage) return '0%';
    return `${this.currentPlan.usage.usedPercentage}%`;
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return '';
    }
  }

  getFeatureIcon(feature: any): string {
    return feature.featureKey.replace(/_/g, '-');
  }
}