import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IConfirmationPopupDataConfig } from '../../interfaces';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-confirmation-popup',
  templateUrl: './confirmation-popup.component.html',
  styleUrl: './confirmation-popup.component.scss'
})
export class ConfirmationPopupComponent {

  inputControl = new FormControl('');

  constructor(
    private dialogRef: MatDialogRef<ConfirmationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IConfirmationPopupDataConfig
  ) {
  }

  close() {
    this.dialogRef.close();
  }

  onAction(result: any) {
    if (this.data.showInput) {
      this.dialogRef.close({ result, inputValue: this.inputControl.value });
    } else {
      this.dialogRef.close(result);
    }
  }
}
