import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserNameInputPopupComponent } from './user-name-input-popup.component';

describe('UserNameInputPopupComponent', () => {
  let component: UserNameInputPopupComponent;
  let fixture: ComponentFixture<UserNameInputPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserNameInputPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserNameInputPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
