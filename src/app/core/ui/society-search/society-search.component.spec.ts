import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocietySearchComponent } from './society-search.component';

describe('SocietySearchComponent', () => {
  let component: SocietySearchComponent;
  let fixture: ComponentFixture<SocietySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SocietySearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SocietySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
