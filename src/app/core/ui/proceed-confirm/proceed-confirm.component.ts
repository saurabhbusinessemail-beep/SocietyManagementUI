import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-proceed-confirm',
  templateUrl: './proceed-confirm.component.html',
  styleUrl: './proceed-confirm.component.scss'
})
export class ProceedConfirmComponent {
  constructor(
    public dialogRef: MatDialogRef<ProceedConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) { }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onProceed(): void {
    this.dialogRef.close(true);
  }
}
