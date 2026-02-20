import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocietyAdminsComponent } from './society-admins.component';

describe('SocietyAdminsComponent', () => {
  let component: SocietyAdminsComponent;
  let fixture: ComponentFixture<SocietyAdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SocietyAdminsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SocietyAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
