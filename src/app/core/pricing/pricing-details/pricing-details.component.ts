import { Component, EventEmitter, Output } from '@angular/core';
import { IPricingPlan } from '../../../interfaces';
import { PricingPlanService } from '../../../services/pricing-plan.service';

@Component({
  selector: 'app-pricing-details',
  templateUrl: './pricing-details.component.html',
  styleUrl: './pricing-details.component.scss'
})
export class PricingDetailsComponent {

  @Output() getStartedWithPlanId = new EventEmitter<IPricingPlan>();

  expandedPlanId: string | null = null;

  features = [
    { name: 'Add Buildings' },
    { name: 'Number of Flats' },
    { name: 'Gate Entries' },
    { name: 'Announcements' },
    { name: 'Smart Gate Pass' },
    { name: 'Visitor Management' },
    { name: 'Tenant Management' },
    { name: 'Flat Member Management' },
    { name: 'Complaints' },
    { name: 'Events' },
    { name: 'Parking / Vehicle' },
    { name: 'Communication' },
    { name: 'Maintenance' },
    { name: 'Offers & Festivals' }
  ];

  constructor(public pricingPlanService: PricingPlanService) {}

  getIncludedCount(plan: IPricingPlan): string {
    const count = plan.features.filter(f => f.included).length;
    return `${count}/${this.features.length}`;
  }

  togglePlan(planId: string): void {
    this.expandedPlanId = this.expandedPlanId === planId ? null : planId;
  }

  isExpanded(planId: string): boolean {
    return this.expandedPlanId === planId;
  }

  hasNotIncludedFeatures(plan: IPricingPlan): boolean {
    return plan.features.some(f => !f.included);
  }
}
