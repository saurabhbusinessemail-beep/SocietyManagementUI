import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocietyService } from '../../../services/society.service';
import { Subject, take, forkJoin, of } from 'rxjs';
import { ISociety, ICurrentPlanResponse } from '../../../interfaces';
import { PERMISSIONS } from '../../../constants';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';
import { SocietyRoles } from '../../../types';
import { PricingPlanService } from '../../../services/pricing-plan.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-society-list',
  templateUrl: './society-list.component.html',
  styleUrl: './society-list.component.scss'
})
export class SocietyListComponent implements OnInit, OnDestroy {

  isComponentActive = new Subject<void>();
  societies: ISociety[] = [];
  societyPlans: Map<string, ICurrentPlanResponse> = new Map();
  loadingPlans: boolean = false;

  get canAddSociety(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_add);
  }

  constructor(
    private societyService: SocietyService,
    private loginService: LoginService,
    private router: Router,
    private planService: PricingPlanService
  ) { }

  ngOnInit(): void {
    this.societyService.selectSocietyFilter(undefined);
    this.loadSocieties();
  }

  loadSocieties() {
    this.societyService.getAllSocieties()
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.societies = response.data ?? [];
          this.loadPlansForSocieties();
        },
        error: () => console.log('Error while getting societies')
      });
  }

  loadPlansForSocieties() {
    if (this.societies.length === 0) return;

    this.loadingPlans = true;
    const planRequests = this.societies.map(society =>
      this.planService.getCurrentPlan(society._id).pipe(
        take(1),
        catchError(() => of(null))
      )
    );

    forkJoin(planRequests).subscribe({
      next: (plans) => {
        plans.forEach((plan, index) => {
          if (plan) {
            this.societyPlans.set(this.societies[index]._id, plan);
          }
        });
        this.loadingPlans = false;
      },
      error: () => {
        this.loadingPlans = false;
      }
    });
  }

  getPlanDisplay(societyId: string): string {
    const plan = this.societyPlans.get(societyId);
    if (!plan) return 'No Active Plan';

    let display = plan.planName || 'No Plan';
    if (plan.selectedDuration) {
      const { value, unit } = plan.selectedDuration;
      if (unit === 'months') {
        display += ` (${value} Month${value > 1 ? 's' : ''})`;
      } else {
        display += ` (${value} Year${value > 1 ? 's' : ''})`;
      }
    }
    return display;
  }

  getRemainingDays(societyId: string): number {
    const plan = this.societyPlans.get(societyId);
    return plan?.usage?.remainingDays || 0;
  }

  handleSocietyClick(society: ISociety) {
    this.societyService.handleSocietyClick(society);
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}