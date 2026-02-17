import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFlatMemberCardComponent } from './my-flat-member-card.component';

describe('MyFlatMemberCardComponent', () => {
  let component: MyFlatMemberCardComponent;
  let fixture: ComponentFixture<MyFlatMemberCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyFlatMemberCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyFlatMemberCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
