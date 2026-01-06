import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplaintFilterComponent } from './complaint-filter.component';

describe('ComplaintFilterComponent', () => {
  let component: ComplaintFilterComponent;
  let fixture: ComponentFixture<ComplaintFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComplaintFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComplaintFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
