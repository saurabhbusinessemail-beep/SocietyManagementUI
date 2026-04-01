import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PricingPlanService } from '../../../services/pricing-plan.service';
import { LoginService } from '../../../services/login.service';
import { IMyProfile, IPlanHistoryItem } from '../../../interfaces';

@Component({
  selector: 'app-plan-history',
  templateUrl: './plan-history.component.html',
  styleUrls: ['./plan-history.component.scss']
})
export class PlanHistoryComponent implements OnInit {
  societyId: string = '';
  plans: IPlanHistoryItem[] = [];
  pagination: { pages: number } = { pages: 1 };
  isLoading = true;
  error: string | null = null;
  myProfile?: IMyProfile;
  currentPage = 1;
  limit = 10;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planService: PricingPlanService,
    public loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();

    this.route.params.subscribe(params => {
      this.societyId = params['societyId'];
      this.loadHistory();
    });
  }

  loadHistory(page = 1): void {
    this.isLoading = true;
    this.currentPage = page;

    this.planService.getPlanHistory(this.societyId, page, this.limit).subscribe({
      next: response => {
        this.plans = response.data ?? [];
        this.pagination = {
          pages: Math.ceil(response.total / this.limit)
        };
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load plan history';
        this.isLoading = false;
      }
    });
  }

  goToCurrentPlan(): void {
    this.router.navigate(['society/current-plan', this.societyId]);
  }

  onPageChange(page: number): void {
    this.loadHistory(page);
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      default: return '';
    }
  }
  
  getCurrentPriceNumber(plan: IPlanHistoryItem) {
    return isNaN(+(plan.price ?? '')) ? 0 : +plan
  }
}