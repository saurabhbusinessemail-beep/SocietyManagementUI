import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionListPopupComponent } from './selection-list-popup.component';

describe('SelectionListPopupComponent', () => {
  let component: SelectionListPopupComponent;
  let fixture: ComponentFixture<SelectionListPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectionListPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectionListPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
