import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingCardComponent } from './building-card.component';

describe('BuildingCardComponent', () => {
  let component: BuildingCardComponent;
  let fixture: ComponentFixture<BuildingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuildingCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuildingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
