import { Component, Input } from '@angular/core';
import { UIBaseFormControl } from '../../../directives';
import { Validators } from '@angular/forms';

@Component({
  selector: 'ui-text-box',
  templateUrl: './text-box.component.html',
  styleUrl: './text-box.component.scss'
})
export class TextBoxComponent extends UIBaseFormControl<string> {


  @Input() type: 'text' | 'email' | 'password' | 'number' | 'phone' | 'textarea' = 'text';
  @Input() rows = 2;
  @Input() autocomplete: string = 'off';

  usernameConfig = {
    id: 'username',
    label: 'Username',
    placeholder: 'Enter username',
    validations: [
    ],
    errorMessages: {
    }
  };


  onInput(value: string): void {
    this.updateValue(value);
  }
}
