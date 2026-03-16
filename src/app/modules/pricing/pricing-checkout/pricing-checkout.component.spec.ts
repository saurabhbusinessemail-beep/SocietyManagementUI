import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingCheckoutComponent } from './pricing-checkout.component';

describe('PricingCheckoutComponent', () => {
  let component: PricingCheckoutComponent;
  let fixture: ComponentFixture<PricingCheckoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PricingCheckoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PricingCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
