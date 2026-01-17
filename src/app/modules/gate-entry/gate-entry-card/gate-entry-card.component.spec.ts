import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GateEntryCardComponent } from './gate-entry-card.component';

describe('GateEntryCardComponent', () => {
  let component: GateEntryCardComponent;
  let fixture: ComponentFixture<GateEntryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GateEntryCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GateEntryCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
