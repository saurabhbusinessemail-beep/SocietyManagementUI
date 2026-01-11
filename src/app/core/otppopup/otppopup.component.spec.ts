import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OTPPopupComponent } from './otppopup.component';

describe('OTPPopupComponent', () => {
  let component: OTPPopupComponent;
  let fixture: ComponentFixture<OTPPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OTPPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OTPPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
