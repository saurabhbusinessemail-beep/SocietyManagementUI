import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IUIControlConfig, IUIDropdownOption } from '../../../interfaces';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {

  usernameConfig = {
    id: 'username',
    label: 'Username',
    placeholder: 'Enter username',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'minlength', validator: Validators.minLength(3) }
    ],
    errorMessages: {
      required: 'Username is required',
      minlength: 'Minimum 3 characters required'
    }
  };
  textNameConfig = {
    id: 'textName',
    label: 'Text Name',
    placeholder: 'Enter username',
    helpText: 'Some Help',
    validations: [
      { name: 'required', validator: Validators.required },
      { name: 'minlength', validator: Validators.minLength(3) }
    ],
    errorMessages: {
      required: 'TextNamename is required',
      minlength: 'Minimum 3 characters required'
    }
  };

  roleConfig: IUIControlConfig = {
    id: 'role',
    label: 'Role',
    placeholder: 'Select role',
    validations: [
      { name: 'required', validator: Validators.required },
    ],
    errorMessages: {
      required: 'Role is required'
    }
  };

  roleOptions: IUIDropdownOption[] = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Manager', value: 'MANAGER' },
    { label: 'User', value: 'USER' }
  ];

  fb = new FormGroup({
    userName: new FormControl('Hello'),
    textName: new FormControl('Hello'),
    role: new FormControl('')
  })
}
