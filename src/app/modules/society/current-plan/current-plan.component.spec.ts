import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentPlanComponent } from './current-plan.component';

describe('CurrentPlanComponent', () => {
  let component: CurrentPlanComponent;
  let fixture: ComponentFixture<CurrentPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CurrentPlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CurrentPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
