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
  @Input() selectCompleteObject: boolean = false;
  @Input() placeholder = 'Select';

  onSelect(value: any): void {
    if (!this.selectCompleteObject)
      this.updateValue(value);
    else {
      const opt = this.options.find(o => o.value === value);
      if (opt) this.updateValue(opt)
    }
  }

  trackByValue(_: number, option: IUIDropdownOption<any>): any {
    if (!this.selectCompleteObject)
      return option.value;
    else
      return option;
  }
}
