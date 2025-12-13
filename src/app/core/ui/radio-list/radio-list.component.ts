import { Component, Input } from '@angular/core';
import { UIBaseFormControl } from '../../../directives';
import { IUIDropdownOption } from '../../../interfaces';

@Component({
  selector: 'ui-radio-list',
  templateUrl: './radio-list.component.html',
  styleUrl: './radio-list.component.scss'
})
export class RadioListComponent extends UIBaseFormControl<any> {

  @Input() options: IUIDropdownOption[] = [];

  /** layout: 'vertical' | 'horizontal' */
  @Input() direction: 'vertical' | 'horizontal' = 'vertical';

  onSelect(value: any): void {
    if (this.disabled) return;
    this.updateValue(value);
  }

  trackByValue(_: number, option: IUIDropdownOption): any {
    return option.value;
  }
}
