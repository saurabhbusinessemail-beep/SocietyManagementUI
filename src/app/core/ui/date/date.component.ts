import { Component, Input } from '@angular/core';
import { UIBaseFormControl } from '../../../directives';

@Component({
  selector: 'ui-date',
  templateUrl: './date.component.html',
  styleUrl: './date.component.scss'
})
export class DateComponent  extends UIBaseFormControl<string> {


  @Input() autocomplete: string = 'off';

  usernameConfig = {
    id: 'date',
    label: 'Date',
    placeholder: 'Enter Date',
  };


  onInput(value: string): void {
    this.updateValue(value);
  }
}
