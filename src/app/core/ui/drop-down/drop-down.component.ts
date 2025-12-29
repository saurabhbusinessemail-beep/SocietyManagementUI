import { Component, Input } from '@angular/core';
import { IUIDropdownOption } from '../../../interfaces';
import { UIBaseFormControl } from '../../../directives';

@Component({
  selector: 'ui-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrl: './drop-down.component.scss'
})
export class DropDownComponent extends UIBaseFormControl<any> {
  @Input() options: IUIDropdownOption<any>[] = [];
  @Input() placeholder = 'Select';

  onSelect(value: any): void {
    this.updateValue(value);
  }

  trackByValue(_: number, option: IUIDropdownOption<any>): any {
    return option.value;
  }
}
