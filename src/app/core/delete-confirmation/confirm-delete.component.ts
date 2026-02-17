import { Component, EventEmitter, Inject, Input, Optional, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete',
  templateUrl: './confirm-delete.component.html',
  styleUrl: './confirm-delete.component.scss'
})
export class ConfirmDeleteComponent {
  @Input() title = 'Delete Confirmation';
  @Input() message = 'Are you sure you want to delete this item?';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  constructor(@Optional() private dialogRef: MatDialogRef<ConfirmDeleteComponent>, @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    if (data) {
      this.title = data?.title ?? this.title;
      this.message = data?.message ?? this.message;
    }
  }

  onDelete() {
    this.confirm.emit();
    if (this.dialogRef) this.dialogRef.close(true);
  }
  onCancel() {
    this.cancel.emit();
    if (this.dialogRef) this.dialogRef.close(false);
  }
  onClose() {
    this.close.emit();
    if (this.dialogRef) this.dialogRef.close(false);
  }
}
