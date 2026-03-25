import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IUIDropdownOption } from '../../interfaces';

@Component({
  selector: 'app-selection-list-popup',
  templateUrl: './selection-list-popup.component.html',
  styleUrl: './selection-list-popup.component.scss'
})
export class SelectionListPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<SelectionListPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public options: IUIDropdownOption<string>[]
  ) { }

  /**
   * Closes the dialog and returns the selected value.
   * @param value - The value of the selected option.
   */
  selectOption(value: string): void {
    this.dialogRef.close(value);
  }

  /**
   * Closes the dialog without returning any value.
   */
  close(): void {
    this.dialogRef.close();
  }
}
