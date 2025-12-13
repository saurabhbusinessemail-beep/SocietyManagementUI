import { Component, Input } from '@angular/core';
import { UIBaseFormControl } from '../../../directives';
import { Validators } from '@angular/forms';

@Component({
  selector: 'ui-text-box',
  templateUrl: './text-box.component.html',
  styleUrl: './text-box.component.scss'
})
export class TextBoxComponent extends UIBaseFormControl<string> {


  @Input() type: 'text' | 'email' | 'password' | 'number' | 'phone' = 'text';
  @Input() autocomplete: string = 'off';

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


  onInput(value: string): void {
    this.updateValue(value);
  }
}
