import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GatePassCardComponent } from './gate-pass-card.component';

describe('GatePassCardComponent', () => {
  let component: GatePassCardComponent;
  let fixture: ComponentFixture<GatePassCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GatePassCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GatePassCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
