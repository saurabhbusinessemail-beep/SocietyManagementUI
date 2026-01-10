import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGatePassComponent } from './add-gate-pass.component';

describe('AddGatePassComponent', () => {
  let component: AddGatePassComponent;
  let fixture: ComponentFixture<AddGatePassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddGatePassComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddGatePassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
