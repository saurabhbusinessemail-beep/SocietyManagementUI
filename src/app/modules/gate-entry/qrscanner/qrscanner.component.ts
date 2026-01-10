import { Component, } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Camera, CameraResultType } from '@capacitor/camera';
import { BrowserQRCodeReader } from '@zxing/browser';

@Component({
  selector: 'app-qrscanner',
  templateUrl: './qrscanner.component.html',
  styleUrl: './qrscanner.component.scss'
})
export class QRScannerComponent {

  scannedData: string | null = null;
  scanError: string = '';

  constructor(
    public dialogRef: MatDialogRef<QRScannerComponent>
  ) {
  }

  async startScan() {
    this.scannedData = null;
    this.scanError = '';
    const scannedText = await this.scan();
    if (!scannedText) return;

    this.scannedData = scannedText
  }

  async scan(): Promise<string | null> {
    try {
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });
      return barcodes.length > 0 ? barcodes[0].rawValue ?? null : null;
    } catch (error) {
      this.scanError = 'QR scan failed';
      return null;
    }
  }


  async upload() {
    try {
      this.scanError = '';

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri
      });

      const scannedText = await this.readQRCode(image.webPath!);
      if (scannedText) {
        this.scannedData = scannedText;
      }
    } catch (error: any) {
      this.scanError = 'No QR code found';
    }
  }

  async readQRCode(webPath: string): Promise<string | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const codeReader = new BrowserQRCodeReader();
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = webPath;

        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject('Canvas rendering context not supported');
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);

          try {
            const qrCodeResult = await codeReader.decodeFromCanvas(canvas);
            resolve(qrCodeResult.getText());
          } catch (error) {
            reject(`Error scanning QR code: ${error}`);
          }
        };

        img.onerror = (error) => reject(`Error loading image: ${error}`);
      } catch (error) {
        reject(`Invalid QR code: ${error}`);
      }
    });
  }

  // validateScannedUser(scannedUser: IUser): string {
  //   if (scannedUser.userId === this.userService.me?.userId)
  //     return 'Invalid QR. You cannot add yourself.'
  //   return '';
  // }

  createAndSaveConnection() {

    // const newUser = new ConnectedUser('client', this.scannedUser, this.socketService);
    this.dialogRef.close(this.scannedData);
  }
}
