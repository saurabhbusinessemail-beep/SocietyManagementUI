import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingSocietyApprovalsComponent } from './pending-society-approvals.component';

describe('PendingSocietyApprovalsComponent', () => {
  let component: PendingSocietyApprovalsComponent;
  let fixture: ComponentFixture<PendingSocietyApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PendingSocietyApprovalsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PendingSocietyApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
