import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyRecordsComponent } from './empty-records.component';

describe('EmptyRecordsComponent', () => {
  let component: EmptyRecordsComponent;
  let fixture: ComponentFixture<EmptyRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmptyRecordsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmptyRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
