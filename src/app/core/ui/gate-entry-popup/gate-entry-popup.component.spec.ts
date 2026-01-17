import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GateEntryPopupComponent } from './gate-entry-popup.component';

describe('GateEntryPopupComponent', () => {
  let component: GateEntryPopupComponent;
  let fixture: ComponentFixture<GateEntryPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GateEntryPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GateEntryPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
