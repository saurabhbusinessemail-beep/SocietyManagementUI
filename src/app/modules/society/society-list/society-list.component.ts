import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocietyService } from '../../../services/society.service';
import { Subject, take, forkJoin, of, merge } from 'rxjs';
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

  loadingSocieties = false;
  loadingPlans: { [societyId: string]: boolean } = {};

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
    this.loadingSocieties = true;
    this.societyService.getAllSocieties()
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.societies = response.data ?? [];
          this.loadingSocieties = false;
          this.loadPlansForSocieties();
        },
        error: () => {
          console.log('Error while getting societies')
          this.loadingSocieties = false;
        }
      });
  }

  loadPlansForSocieties() {
    if (this.societies.length === 0) return;

    this.societies.forEach(s => this.loadingPlans[s._id] = true);
    const planRequests = this.societies.map(society =>
      this.planService.getCurrentPlan(society._id).pipe(
        take(1),
        catchError(() => of(null))
      )
    );

    merge(...planRequests).pipe(take(this.societies.length))
      .subscribe({
        next: response => {
          if (response) {
            const societyId = typeof response.societyId === 'string' ? response.societyId : response.societyId._id
            this.societyPlans.set(societyId, response);
            this.loadingPlans[societyId] = false;
          }
        }
      })
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