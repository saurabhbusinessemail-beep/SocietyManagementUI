import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocietyManagersComponent } from './society-managers.component';

describe('SocietyManagersComponent', () => {
  let component: SocietyManagersComponent;
  let fixture: ComponentFixture<SocietyManagersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SocietyManagersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SocietyManagersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
