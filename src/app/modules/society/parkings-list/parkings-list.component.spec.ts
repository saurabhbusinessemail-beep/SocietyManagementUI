import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingsListComponent } from './parkings-list.component';

describe('ParkingsListComponent', () => {
  let component: ParkingsListComponent;
  let fixture: ComponentFixture<ParkingsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParkingsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParkingsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
