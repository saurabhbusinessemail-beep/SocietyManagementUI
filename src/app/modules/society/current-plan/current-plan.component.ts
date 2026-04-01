// current-plan.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ISociety, IMyProfile, ICurrentPlanResponse } from '../../../interfaces';
import { LoginService } from '../../../services/login.service';
import { SocietyService } from '../../../services/society.service';
import { PricingPlanService } from '../../../services/pricing-plan.service';

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

  get currentPriceNumber() {
    return !this.currentPlan || isNaN(+(this.currentPlan.price ?? '')) ? 0 : +this.currentPlan.price
  }

  // Helper to get duration display text
  getDurationDisplay(): string {
    if (!this.currentPlan?.selectedDuration) return 'Not specified';

    const { value, unit } = this.currentPlan.selectedDuration;
    if (unit === 'months') {
      return `${value} Month${value > 1 ? 's' : ''}`;
    }
    return `${value} Year${value > 1 ? 's' : ''}`;
  }

  // Calculate total days from start and end dates
  getTotalDays(): number {
    if (!this.currentPlan?.startDate || !this.currentPlan?.endDate) return 0;

    const start = new Date(this.currentPlan.startDate);
    const end = new Date(this.currentPlan.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      next: (response: ICurrentPlanResponse) => {
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
}