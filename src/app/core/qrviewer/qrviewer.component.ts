import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-qrviewer',
  templateUrl: './qrviewer.component.html',
  styleUrl: './qrviewer.component.scss'
})
export class QRViewerComponent {

  @ViewChild('qrCode', { static: false }) qrCodeElement!: QRCodeComponent;

  constructor(
    private dialogRef: MatDialogRef<QRViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { qrCodeString: string; label: string; value: string; }
  ) {
    console.log('data = ', data)
  }

  downloadQRCode(qrCodeElement: QRCodeComponent) {
    setTimeout(() => { // Ensure QR code is fully rendered
      const qrCanvas = qrCodeElement.qrcElement.nativeElement.querySelector('canvas');

      if (qrCanvas) {
        const imageUrl = qrCanvas.toDataURL('image/png'); // Convert to PNG format

        // Create a download link
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'small-games.user.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }, 100); // Delay to allow QR code rendering
  }

  close() {
    this.dialogRef.close();
  }
}
