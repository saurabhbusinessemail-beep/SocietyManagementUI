import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QRScannerComponent } from './qrscanner.component';

describe('QRScannerComponent', () => {
  let component: QRScannerComponent;
  let fixture: ComponentFixture<QRScannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QRScannerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QRScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
