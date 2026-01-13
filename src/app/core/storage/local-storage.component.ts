import { Component } from '@angular/core';
import { LocalStorageCaptureService } from '../../services/local-storage-capture.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-local-storage',
  templateUrl: './local-storage.component.html',
  styleUrl: './local-storage.component.scss'
})
export class LocalStorageComponent {
  constructor(
    public lss: LocalStorageCaptureService,
    private dialogRef: MatDialogRef<LocalStorageComponent>
  ) { }

  get localStorageData(): { key: string, value: any }[] {
    return this.lss.getLocalStorageData();
  }

  clear() {
    this.lss.clearLocalStorage();
  }

  remove(key: string) {
    this.lss.removeStorage(key);
  }

  close() {
    this.dialogRef.close();
  }
}
