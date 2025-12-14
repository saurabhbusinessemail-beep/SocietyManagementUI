import { Component, Input } from '@angular/core';
import { UIBaseFormControl } from '../../../directives';
import { UILabelValueType } from '../../../types';

@Component({
  selector: 'ui-label',
  templateUrl: './label.component.html',
  styleUrl: './label.component.scss'
})
export class LabelComponent extends UIBaseFormControl<any> {


  /** /** Direct value input (used if form control is not bound) */
  @Input() valueText?: string | number;


  /** Layout direction */
  @Input() direction: 'horizontal' | 'vertical' = 'horizontal';


  /** Value type controls color */
  @Input() valueType: UILabelValueType = 'default';

  @Input() revertColonShow = false;


  get displayValue(): string | number | null {
    return this.value ?? this.valueText ?? null;
  }
}
