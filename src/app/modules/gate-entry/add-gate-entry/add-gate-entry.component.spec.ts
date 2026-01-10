import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGateEntryComponent } from './add-gate-entry.component';

describe('AddGateEntryComponent', () => {
  let component: AddGateEntryComponent;
  let fixture: ComponentFixture<AddGateEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddGateEntryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddGateEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
