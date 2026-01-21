import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlatMemberCardComponent } from './flat-member-card.component';

describe('FlatMemberCardComponent', () => {
  let component: FlatMemberCardComponent;
  let fixture: ComponentFixture<FlatMemberCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlatMemberCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FlatMemberCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
