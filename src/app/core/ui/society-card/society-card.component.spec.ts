import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocietyCardComponent } from './society-card.component';

describe('SocietyCardComponent', () => {
  let component: SocietyCardComponent;
  let fixture: ComponentFixture<SocietyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SocietyCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SocietyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
