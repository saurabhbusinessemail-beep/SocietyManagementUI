import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingCheckoutComponent } from './pricing-checkout.component';
import { LoginService } from '../../../services/login.service';
import { PricingPlanService } from '../../../services/pricing-plan.service';
import { SocietyService } from '../../../services/society.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { NgZone, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormattedPricePipe } from '../../../pipes/formatted-price.pipe';
import { CurrencyService } from '../../../services/currency.service';
import { mockPlanPaid } from './pricing-checkout.component.mock';

describe('PricingCheckoutComponent', () => {
  let component: PricingCheckoutComponent;
  let fixture: ComponentFixture<PricingCheckoutComponent>;

  let pricingPlanService: jasmine.SpyObj<PricingPlanService>;
  let societyService: jasmine.SpyObj<SocietyService>;
  let loginService: jasmine.SpyObj<LoginService>;
  let currencyService: jasmine.SpyObj<CurrencyService>;

  let route: any;
  let router: jasmine.SpyObj<Router>;
  let location: jasmine.SpyObj<Location>;
  let ngZone: NgZone;

  beforeEach(async () => {

    const pricingPlanServiceSpy = jasmine.createSpyObj('PricingPlanService', [
      'getPlanById',
      'getPlanDurations',
      'getCurrentPlan',
      'calculateChangePrice',
      'validateCoupon',
      'purchasePlan',
      'changePlan',
      'verifyPayment'
    ]);
    (pricingPlanServiceSpy as any).plans = [];

    const societyServiceSpy = jasmine.createSpyObj('SocietyService', [
      'getSociety'
    ]);

    const loginServiceSpy = jasmine.createSpyObj('LoginService', [
      'getProfileFromStorage',
      'loginAndReturn'
    ]);

    const currencyServiceSpy = jasmine.createSpyObj('CurrencyService', ['getRate'])

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const locationSpy = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      declarations: [PricingCheckoutComponent, FormattedPricePipe],
      providers: [
        FormBuilder,
        { provide: PricingPlanService, useValue: pricingPlanServiceSpy },
        { provide: SocietyService, useValue: societyServiceSpy },
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Location, useValue: locationSpy },
        { provide: CurrencyService, useValue: currencyServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ societyId: 'soc1', planId: 'plan1' })
          }
        },
        // NgZone
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PricingCheckoutComponent);
    component = fixture.componentInstance;

    pricingPlanService = TestBed.inject(PricingPlanService) as jasmine.SpyObj<PricingPlanService>;
    societyService = TestBed.inject(SocietyService) as jasmine.SpyObj<SocietyService>;
    loginService = TestBed.inject(LoginService) as jasmine.SpyObj<LoginService>;
    currencyService = TestBed.inject(CurrencyService) as jasmine.SpyObj<CurrencyService>
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    location = TestBed.inject(Location) as jasmine.SpyObj<Location>;
    route = TestBed.inject(ActivatedRoute);
    ngZone = TestBed.inject(NgZone);

    // fixture.detectChanges();
  });

  it('should create', () => {
    console.log('11111111111111')
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set selectedPlan and call loadAvailableDurations when plan is found via getPlanById', () => {
    const mockPlan = mockPlanPaid;
    pricingPlanService.getPlanById.and.returnValue(of(mockPlan));
    spyOn(component, 'loadAvailableDurations').and.callThrough();
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.selectedPlan).toEqual(mockPlan);
    expect(component.loadAvailableDurations).toHaveBeenCalled();
  });

});
