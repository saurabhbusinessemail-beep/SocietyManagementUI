import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProceedConfirmComponent } from './proceed-confirm.component';

describe('ProceedConfirmComponent', () => {
  let component: ProceedConfirmComponent;
  let fixture: ComponentFixture<ProceedConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProceedConfirmComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProceedConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
