import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFlatListComponent } from './my-flat-list.component';

describe('MyFlatListComponent', () => {
  let component: MyFlatListComponent;
  let fixture: ComponentFixture<MyFlatListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyFlatListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyFlatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
