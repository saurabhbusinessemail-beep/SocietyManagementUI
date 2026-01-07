import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { IUIControlConfig } from '../../interfaces';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-user-name-input-popup',
  templateUrl: './user-name-input-popup.component.html',
  styleUrl: './user-name-input-popup.component.scss'
})
export class UserNameInputPopupComponent {

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

  constructor(private dialogRef: MatDialogRef<UserNameInputPopupComponent>) { }

  save() {
    if (!this.userNameFormControl.valid) return;

    this.dialogRef.close(this.userNameFormControl.value);
  }
}
