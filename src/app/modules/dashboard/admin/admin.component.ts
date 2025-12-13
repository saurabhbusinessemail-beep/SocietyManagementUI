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

  userSearchConfig: IUIControlConfig = {
    id: 'user',
    label: 'User',
    placeholder: 'Search User',
    validations: [
      { name: 'required', validator: Validators.required },
    ],
    errorMessages: {
      required: 'User is required'
    }
  };

  roleOptions: IUIDropdownOption[] = [
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Manager', value: 'MANAGER' },
    { label: 'User', value: 'USER' }
  ];

  filteredUsers: IUIDropdownOption[] = [
    { label: 'Saurabh Kumar', value: 'USR_001' },
    { label: 'Amit Sharma', value: 'USR_002' },
    { label: 'Neha Verma', value: 'USR_003' },
    { label: 'Rohit Mehta', value: 'USR_004' },
    { label: 'Pooja Singh', value: 'USR_005' }
  ];

  fb = new FormGroup({
    userName: new FormControl('Hello'),
    textName: new FormControl('Hello'),
    role: new FormControl(''),
    user: new FormControl<IUIDropdownOption | undefined>(undefined)
  })

  onUserSearch(text: string) {}
}
