import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IUIControlConfig } from '../../interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-user-name-input-popup',
  templateUrl: './user-name-input-popup.component.html',
  styleUrl: './user-name-input-popup.component.scss'
})
export class UserNameInputPopupComponent implements OnInit {

  userNameConfig: IUIControlConfig = {
    id: 'userName',
    label: 'Your Name',
    placeholder: 'Enter Your Name',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'minlength', validator: Validators.minLength(3) }
    ],
    errorMessages: {
      required: 'Your Name is required.',
      minlength: 'Minimum 3 characters required'
    }
  };

  userNameFormControl = new FormControl<string | null>(null, Validators.required);

  constructor(
    private dialogRef: MatDialogRef<UserNameInputPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userName?: string }
  ) { }

  ngOnInit(): void {
    if (this.data.userName)
      this.userNameFormControl.setValue(this.data.userName, { emitEvent: false });
  }

  save() {
    if (!this.userNameFormControl.valid) return;

    this.dialogRef.close(this.userNameFormControl.value);
  }

  cancel() {
    this.dialogRef.close();
  }
}
