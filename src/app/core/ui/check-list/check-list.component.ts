import { Component, Input } from '@angular/core';
import { UIBaseFormControl } from '../../../directives';
import { IUIDropdownOption } from '../../../interfaces';


@Component({
  selector: 'ui-checklist',
  templateUrl: './check-list.component.html',
  styleUrls: ['./check-list.component.scss']
})
export class CheckListComponent extends UIBaseFormControl<any[]> {


  @Input() options: IUIDropdownOption[] = [];
  @Input() direction: 'horizontal' | 'vertical' = 'vertical';


  override writeValue(value: any[]): void {
    this.value = Array.isArray(value) ? value : [];
  }


  toggle(option: IUIDropdownOption, checked: boolean): void {
    if (this.disabled || option.disabled) return;

    const updated = new Set(this.value || []);


    checked ? updated.add(option.value) : updated.delete(option.value);

    this.updateValue(Array.from(updated));
  }


  isChecked(option: IUIDropdownOption): boolean {
    return Array.isArray(this.value) && this.value.includes(option.value);
  }
}