import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingFlatApprovalsComponent } from './pending-flat-approvals.component';

describe('PendingFlatApprovalsComponent', () => {
  let component: PendingFlatApprovalsComponent;
  let fixture: ComponentFixture<PendingFlatApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PendingFlatApprovalsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PendingFlatApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
