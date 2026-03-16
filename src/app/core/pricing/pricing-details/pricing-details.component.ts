import { Component } from '@angular/core';
import { IPricingPlan } from '../../../interfaces';

@Component({
  selector: 'app-pricing-details',
  templateUrl: './pricing-details.component.html',
  styleUrl: './pricing-details.component.scss'
})
export class PricingDetailsComponent {

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

  plans: IPricingPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      icon: 'building2',
      price: 'Free',
      period: 'forever',
      buttonText: 'Get Started',
      colors: {
        primary: '#475569',        // slate-600 (icon)
        light: '#e2e8f0',          // slate-200 (icon bg, border)
        lighter: '#f1f5f9',        // slate-100 (gradient from)
        border: '#e2e8f0',         // slate-200
        text: '#334155',           // slate-700 (price)
        button: '#334155',         // slate-700
        buttonHover: '#1e293b',    // slate-800
        gradientFrom: '#f1f5f9',   // slate-100
        gradientTo: '#f8fafc',
      },
      features: [
        { name: 'Add Buildings', value: '1 Building', included: true },
        { name: 'Number of Flats', value: '10–12 Flats', included: true },
        { name: 'Gate Entries', included: true },
        { name: 'Announcements', included: true },
        { name: 'Smart Gate Pass', included: false },
        { name: 'Visitor Management', included: false },
        { name: 'Tenant Management', included: false },
        { name: 'Flat Member Management', included: false },
        { name: 'Complaints', included: false },
        { name: 'Events', included: false },
        { name: 'Parking / Vehicle', included: false },
        { name: 'Communication', included: false },
        { name: 'Maintenance', included: false },
        { name: 'Offers & Festivals', included: false }
      ]
    },
    {
      id: 'silver',
      name: 'Silver',
      icon: 'star',
      price: '10',
      priceSuffix: '₹',
      priceNote: '/flat',
      period: 'mo, billed yearly',
      buttonText: 'Get Started',
      colors: {
        primary: '#1d4ed8',        // blue-700 (icon, price)
        light: '#bfdbfe',          // blue-200 (icon bg, border)
        lighter: '#dbeafe',        // blue-100 (gradient from)
        border: '#bfdbfe',         // blue-200
        text: '#1d4ed8',           // blue-700
        button: '#2563eb',         // blue-600
        buttonHover: '#1d4ed8',    // blue-700
        gradientFrom: '#dbeafe',   // blue-100
        gradientTo: '#eff6ff'      // blue-50
      },
      features: [
        { name: 'Add Buildings', value: 'Unlimited', included: true },
        { name: 'Number of Flats', value: 'Unlimited', included: true },
        { name: 'Gate Entries', included: true },
        { name: 'Announcements', included: true },
        { name: 'Smart Gate Pass', included: true },
        { name: 'Visitor Management', included: true },
        { name: 'Tenant Management', included: true },
        { name: 'Flat Member Management', included: true },
        { name: 'Complaints', included: false },
        { name: 'Events', included: false },
        { name: 'Parking / Vehicle', included: false },
        { name: 'Communication', included: false },
        { name: 'Maintenance', included: false },
        { name: 'Offers & Festivals', included: true }
      ]
    },
    {
      id: 'gold',
      name: 'Gold',
      icon: 'zap',
      price: '20',
      priceSuffix: '₹',
      priceNote: '/flat',
      period: 'mo, billed yearly',
      badge: 'POPULAR',
      buttonText: 'Get Started',
      isPopular: true,
      colors: {
        primary: '#b45309',        // amber-700 (icon, price)
        light: '#fcd34d',          // amber-300 (icon bg, border)
        lighter: '#fde68a',        // amber-200 (gradient from)
        border: '#fcd34d',         // amber-300
        text: '#b45309',           // amber-700
        badgeBg: '#f59e0b',        // amber-500
        buttonFrom: '#f59e0b',     // amber-500
        buttonTo: '#eab308',       // yellow-500
        gradientFrom: '#fde68a',   // amber-200
        gradientTo: '#fffbeb'      // amber-50
      },
      features: [
        { name: 'Add Buildings', value: 'Unlimited', included: true },
        { name: 'Number of Flats', value: 'Unlimited', included: true },
        { name: 'Gate Entries', included: true },
        { name: 'Announcements', included: true },
        { name: 'Smart Gate Pass', included: true },
        { name: 'Visitor Management', included: true },
        { name: 'Tenant Management', included: true },
        { name: 'Flat Member Management', included: true },
        { name: 'Complaints', included: true },
        { name: 'Events', included: true },
        { name: 'Parking / Vehicle', included: true },
        { name: 'Communication', included: false },
        { name: 'Maintenance', included: false },
        { name: 'Offers & Festivals', included: true }
      ]
    },
    {
      id: 'platinum',
      name: 'Platinum',
      icon: 'award',
      price: '30',
      priceSuffix: '₹',
      priceNote: '/flat',
      period: 'mo, billed yearly',
      buttonText: 'Get Started',
      colors: {
        primary: '#6d28d9',        // violet-700 (icon, price)
        light: '#ddd6fe',          // violet-200 (icon bg, border)
        lighter: '#ede9fe',        // violet-100 (gradient from)
        border: '#ddd6fe',         // violet-200
        text: '#6d28d9',           // violet-700
        button: '#7c3aed',         // violet-600
        buttonHover: '#6d28d9',    // violet-700
        gradientFrom: '#ede9fe',   // violet-100
        gradientTo: '#f5f3ff'      // violet-50
      },
      features: [
        { name: 'Add Buildings', value: 'Unlimited', included: true },
        { name: 'Number of Flats', value: 'Unlimited', included: true },
        { name: 'Gate Entries', included: true },
        { name: 'Announcements', included: true },
        { name: 'Smart Gate Pass', included: true },
        { name: 'Visitor Management', included: true },
        { name: 'Tenant Management', included: true },
        { name: 'Flat Member Management', included: true },
        { name: 'Complaints', included: true },
        { name: 'Events', included: true },
        { name: 'Parking / Vehicle', included: true },
        { name: 'Communication', included: true },
        { name: 'Maintenance', included: false },
        { name: 'Offers & Festivals', included: true }
      ]
    },
    {
      id: 'diamond',
      name: 'Diamond',
      icon: 'gem',
      price: '40',
      priceSuffix: '₹',
      priceNote: '/flat',
      period: 'mo, billed yearly',
      badge: 'BEST VALUE',
      buttonText: 'Get Started',
      isBestValue: true,
      colors: {
        primary: '#0f766e',        // teal-700 (icon, price)
        light: '#99f6e4',          // teal-200 (icon bg, border)
        lighter: '#ccfbf1',        // teal-100 (gradient from)
        border: '#99f6e4',         // teal-200
        text: '#0f766e',           // teal-700
        badgeBg: '#14b8a6',        // teal-500
        buttonFrom: '#14b8a6',     // teal-500
        buttonTo: '#06b6d4',       // cyan-500
        gradientFrom: '#ccfbf1',   // teal-100
        gradientTo: '#f0fdfa'      // teal-50
      },
      features: [
        { name: 'Add Buildings', value: 'Unlimited', included: true },
        { name: 'Number of Flats', value: 'Unlimited', included: true },
        { name: 'Gate Entries', included: true },
        { name: 'Announcements', included: true },
        { name: 'Smart Gate Pass', included: true },
        { name: 'Visitor Management', included: true },
        { name: 'Tenant Management', included: true },
        { name: 'Flat Member Management', included: true },
        { name: 'Complaints', included: true },
        { name: 'Events', included: true },
        { name: 'Parking / Vehicle', included: true },
        { name: 'Communication', included: true },
        { name: 'Maintenance', included: true },
        { name: 'Offers & Festivals', included: true }
      ]
    }
  ];

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
