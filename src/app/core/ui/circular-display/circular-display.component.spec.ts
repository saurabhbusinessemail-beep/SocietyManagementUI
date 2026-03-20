import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircularDisplayComponent } from './circular-display.component';

describe('CircularDisplayComponent', () => {
  let component: CircularDisplayComponent;
  let fixture: ComponentFixture<CircularDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CircularDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CircularDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
