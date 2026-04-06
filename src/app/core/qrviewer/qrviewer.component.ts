import { Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QRCodeComponent } from 'angularx-qrcode';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
  ) { }

  async downloadQRCode(qrCodeElement: QRCodeComponent) {
    // Wait for QR code to render
    setTimeout(async () => {
      const qrCanvas = qrCodeElement.qrcElement.nativeElement.querySelector('canvas');
      if (!qrCanvas) return;

      if (Capacitor.isNativePlatform()) {
        // Capacitor native – use Filesystem API
        const imageDataUrl = qrCanvas.toDataURL('image/png');
        const base64Data = imageDataUrl.split(',')[1]; // Remove data:image/png;base64,

        const fileName = `qr_code_${Date.now()}.png`;

        try {
          // Save to device's external storage (or Documents directory)
          await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Documents, // or Directory.Data, Directory.ExternalStorage
            recursive: true
          });

          // Optional: Notify user and offer to open the file
          this.showSaveSuccess(fileName);
        } catch (error) {
          console.error('Error saving QR code:', error);
          // Fallback: try to open in browser or show alert
          this.fallbackDownload(imageDataUrl);
        }
      } else {
        // Web – use anchor download
        const imageUrl = qrCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'qr_code.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }, 100);
  }

  private async showSaveSuccess(fileName: string) {
    // Simple alert (you can replace with a Snackbar/Toast)
    alert(`QR code saved as ${fileName} in Documents folder.`);
    // Optionally use Capacitor Share plugin to let the user open or share the file
    // const { Share } = await import('@capacitor/share');
    // await Share.share({ files: [`${Directory.Documents}/${fileName}`] });
  }

  private fallbackDownload(imageDataUrl: string) {
    // Last resort: open the data URL in a new window (might work in some WebViews)
    const win = window.open();
    if (win) {
      win.document.write(`<img src="${imageDataUrl}" alt="QR Code" />`);
    } else {
      alert('Unable to save the QR code. Please take a screenshot.');
    }
  }

  close() {
    this.dialogRef.close();
  }
}