import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QRViewerComponent } from './qrviewer.component';

describe('QRViewerComponent', () => {
  let component: QRViewerComponent;
  let fixture: ComponentFixture<QRViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QRViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QRViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
