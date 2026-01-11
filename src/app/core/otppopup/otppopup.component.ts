import { Component } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { IUIControlConfig } from '../../interfaces';

@Component({
  selector: 'app-otppopup',
  templateUrl: './otppopup.component.html',
  styleUrl: './otppopup.component.scss'
})
export class OTPPopupComponent {
  otpConfig: IUIControlConfig = {
    id: 'otp',
    label: 'OTP',
    placeholder: 'Enter OTP',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'minlength', validator: Validators.minLength(6) },
      { name: 'maxlength', validator: Validators.maxLength(6) }
    ],
    errorMessages: {
      required: 'Your Name is required.',
      minlength: 'OTP is of 6 digits',
      maxlength: 'OTP is of 6 digits'
    }
  };

  otpFormControl = new FormControl<string | null>(null, Validators.required);

  constructor(private dialogRef: MatDialogRef<OTPPopupComponent>) { }

  save() {
    if (!this.otpFormControl.valid) return;

    this.dialogRef.close(this.otpFormControl.value);
  }
}
