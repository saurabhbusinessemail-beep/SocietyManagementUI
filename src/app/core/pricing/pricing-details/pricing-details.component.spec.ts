import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingDetailsComponent } from './pricing-details.component';

describe('PricingDetailsComponent', () => {
  let component: PricingDetailsComponent;
  let fixture: ComponentFixture<PricingDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PricingDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PricingDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
