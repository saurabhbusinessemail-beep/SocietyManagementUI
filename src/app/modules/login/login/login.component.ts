import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { WindowService } from '../../../services/window.service';
import { Router } from '@angular/router';
import { LoginService } from '../../../services/login.service';
import { IPricingPlan } from '../../../interfaces';

interface IFeatures {
  iconName: string;
  iconClass?: string;
  bgColorClass: string;
  textColorClass: string;
  title: string;
  description: string;
  svgPath: string;
  isSpecial?: boolean;
}

interface IHowItWorksStep {
  stepNumber: string;
  title: string;
  description: string;
}

interface IJoinAsFeature {
  text: string;
}

interface IJoinAsCard {
  id: string;
  role: string;
  title: string;
  description: string;
  badgeText: string;
  badgeClass: string;
  iconName: string;
  iconWrapperClass: string;
  iconColorClass: string;
  gradientClass: string;
  buttonGradientClass: string;
  dotGradientClass: string;
  features: IJoinAsFeature[];
}

enum PageSections {
  FEATURES = 'Features',
  HOWITWORKS = 'How It Works',
  PRICING = 'Pricing',
  JOINAS = 'Join As',
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  isComponentActive = new Subject<void>();

  features: IFeatures[] = [
    {
      iconName: 'building2',
      bgColorClass: 'bg-blue-100',
      textColorClass: 'text-blue-600',
      title: 'Societies',
      description: 'Manage multiple residential societies from a single unified dashboard view.',
      svgPath: 'M10 12h4 M10 8h4 M14 21v-3a2 2 0 0 0-4 0v3 M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2 M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16'
    },
    {
      iconName: 'house',
      bgColorClass: 'bg-indigo-100',
      textColorClass: 'text-indigo-600',
      title: 'Buildings',
      description: 'Organize large complexes by tracking specific buildings, wings, and blocks.',
      svgPath: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8 M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
    },
    {
      iconName: 'door-open',
      bgColorClass: 'bg-purple-100',
      textColorClass: 'text-purple-600',
      title: 'Flats',
      description: 'Maintain detailed records of flats, their current occupancy status, and ownership.',
      svgPath: 'M11 20H2 M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z M11 4H8a2 2 0 0 0-2 2v14 M14 12h.01 M22 20h-3'
    },
    {
      iconName: 'log-out',
      bgColorClass: 'bg-rose-100',
      textColorClass: 'text-rose-600',
      title: 'Gate Entry',
      description: 'Real-time logging and monitoring of all inbound and outbound gate activities.',
      svgPath: 'm16 17 5-5-5-5 M21 12H9 M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'
    },
    {
      iconName: 'ticket',
      bgColorClass: 'bg-orange-100',
      textColorClass: 'text-orange-600',
      title: 'Gate Pass',
      description: 'Generate secure digital gate passes for expected guests and service staff.',
      svgPath: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z M13 5v2 M13 17v2 M13 11v2'
    },
    {
      iconName: 'message-square-warning',
      bgColorClass: 'bg-amber-100',
      textColorClass: 'text-amber-600',
      title: 'Complaints',
      description: 'Digital ticketing system for residents to submit and track maintenance requests.',
      svgPath: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z M12 15h.01 M12 7v4'
    },
    {
      iconName: 'users',
      bgColorClass: 'bg-emerald-100',
      textColorClass: 'text-emerald-600',
      title: 'Members',
      description: 'Comprehensive directory of society committee members and flat owners.',
      svgPath: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3.128a4 4 0 0 1 0 7.744 M22 21v-2a4 4 0 0 0-3-3.87 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0'
    },
    {
      iconName: 'user-check',
      bgColorClass: 'bg-teal-100',
      textColorClass: 'text-teal-600',
      title: 'Tenants',
      description: 'Track tenant information, lease durations, and move-in/move-out details.',
      svgPath: 'm16 11 2 2 4-4 M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0'
    },
    {
      iconName: 'user-plus',
      bgColorClass: 'bg-cyan-100',
      textColorClass: 'text-cyan-600',
      title: 'Visitors',
      description: 'Digital logbook replacing paper registers for better security and accountability.',
      svgPath: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M19 8v6 M22 11h-6'
    },
    {
      iconName: 'megaphone',
      bgColorClass: 'bg-sky-100',
      textColorClass: 'text-sky-600',
      title: 'Announcements',
      description: 'Instantly broadcast important notices and alerts to all registered residents.',
      svgPath: 'M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14 M8 6v8'
    },
    {
      iconName: 'car',
      bgColorClass: 'bg-slate-100',
      textColorClass: 'text-slate-600',
      title: 'Vehicles',
      description: 'Register resident vehicles and manage parking spot allocations securely.',
      svgPath: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2 M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M9 17h6 M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0'
    }
  ];

  howItWorksSteps: IHowItWorksStep[] = [
    {
      stepNumber: '01',
      title: 'Register your Society',
      description: 'Create an account, set up your building structure, and define roles in minutes. Our onboarding wizard makes it effortless.'
    },
    {
      stepNumber: '02',
      title: 'Add Members & Residents',
      description: 'Invite owners and tenants to join. They can download the mobile app to get verified and stay connected.'
    },
    {
      stepNumber: '03',
      title: 'Manage Everything Digitally',
      description: 'From gate approvals to maintenance complaints, everything is logged securely in the cloud and accessible anytime.'
    }
  ];

  joinAsCards: IJoinAsCard[] = [
    {
      id: 'owner',
      role: 'For Flat Owners',
      title: 'Join as Owner',
      description: 'Manage your property, track maintenance requests, view financial statements, and stay connected with your society committee — all from one place.',
      badgeText: 'For Flat Owners',
      badgeClass: 'badge-blue',
      iconName: 'house',
      iconWrapperClass: 'icon-wrapper-blue',
      iconColorClass: 'icon-blue',
      gradientClass: 'gradient-bar-blue',
      buttonGradientClass: 'button-gradient-blue',
      dotGradientClass: 'dot-gradient-blue',
      features: [
        { text: 'View & pay maintenance bills' },
        { text: 'Raise complaints' },
        { text: 'Track visitors & gate passes' },
        { text: 'Society announcements' }
      ]
    },
    {
      id: 'tenant',
      role: 'For Tenants',
      title: 'Join as Tenant',
      description: 'Access everything you need as a resident — raise service requests, get visitor gate passes, stay updated on announcements, and manage your rental documents.',
      badgeText: 'For Tenants',
      badgeClass: 'badge-violet',
      iconName: 'key-round',
      iconWrapperClass: 'icon-wrapper-violet',
      iconColorClass: 'icon-violet',
      gradientClass: 'gradient-bar-violet',
      buttonGradientClass: 'button-gradient-violet',
      dotGradientClass: 'dot-gradient-violet',
      features: [
        { text: 'Generate visitor gate passes' },
        { text: 'Raise service complaints' },
        { text: 'View announcements' },
        { text: 'Manage tenancy docs' }
      ]
    },
    {
      id: 'security',
      role: 'For Security Staff',
      title: 'Join as Security',
      description: 'Streamline gate operations — log visitor entries and exits, verify gate passes, track vehicle movement, and keep the society safe with a digital register.',
      badgeText: 'For Security Staff',
      badgeClass: 'badge-emerald',
      iconName: 'shield-check',
      iconWrapperClass: 'icon-wrapper-emerald',
      iconColorClass: 'icon-emerald',
      gradientClass: 'gradient-bar-emerald',
      buttonGradientClass: 'button-gradient-emerald',
      dotGradientClass: 'dot-gradient-emerald',
      features: [
        { text: 'Log gate entries & exits' },
        { text: 'Verify visitor gate passes' },
        { text: 'Track vehicle movement' },
        { text: 'Digital duty register' }
      ]
    }
  ];

  iconPaths: Record<string, string[]> = {
    'house': [
      'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8',
      'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
    ],
    'key-round': [
      'M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z',
      'M16.5 7.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z'
    ],
    'shield-check': [
      'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      'm9 12 2 2 4-4'
    ]
  };

  PageSections = PageSections;

  pageSections: string[] = [
    PageSections.FEATURES,
    PageSections.HOWITWORKS,
    PageSections.PRICING,
    PageSections.JOINAS
  ]

  get enableShoeMoreFeature(): boolean {
    return this.windowService.mode.value !== 'desktop';
  }

  constructor(
    private loginService: LoginService,
    private windowService: WindowService,
    private router: Router
  ) { }

  ngOnInit(): void { }

  generateHref(item: string): string {
    return item.toLowerCase().replace(/\s+/g, '-');
  }

  scrollToElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  simpleLogin() {
    this.loginService.simpleLogin();
  }

  loginAndJoinAs(role: string) {
    this.loginService.loginAndJoinAs(role);
  }

  gotoAddSociety() {
    this.router.navigateByUrl('/society-public/add');
  }

  gotoBookDemo() {
    this.router.navigateByUrl('/demo/book');
  }

  gotoPricingPlanCheckout(plan: IPricingPlan) {
    console.log('plan = ', plan)
    // const societyId = 'abcd699055620c4bd294ac82c4bc';
    this.router.navigate(['pricing-plan/checkout', plan._id]);
  }

  handleMenuItemClick(clickedItem: string): void {
    console.log('Menu item clicked:', clickedItem);
    // Do something with the clicked item
    // e.g., navigate to section, open modal, etc.

    // Example: Scroll to section
    const element = document.getElementById(clickedItem.toLowerCase().replace(/\s+/g, '-'));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }


  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}