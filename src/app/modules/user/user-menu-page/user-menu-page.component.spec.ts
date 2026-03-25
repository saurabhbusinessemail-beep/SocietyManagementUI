import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMenuPageComponent } from './user-menu-page.component';

describe('UserMenuPageComponent', () => {
  let component: UserMenuPageComponent;
  let fixture: ComponentFixture<UserMenuPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserMenuPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserMenuPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
