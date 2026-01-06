import { Component, Input } from '@angular/core';
import { UIBaseFormControl } from '../../../directives';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'ui-date',
  templateUrl: './date.component.html',
  styleUrl: './date.component.scss'
})
export class DateComponent extends UIBaseFormControl<Date | undefined> {


  @Input() autocomplete: string = 'off';

  usernameConfig = {
    id: 'date',
    label: 'Date',
    placeholder: 'Enter Date',
  };


  onInput(event: MatDatepickerInputEvent<Date>): void {
    this.updateValue(event.value ?? undefined);
  }
}
