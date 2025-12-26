import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UIBaseFormControl } from '../../../directives';

@Component({
  selector: 'ui-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent extends UIBaseFormControl<void> {

  @Input() type: 'primary' | 'cancel' | 'error' | 'only-content' = 'primary';
  @Input() isSubmit = false;
  @Input() label: string = 'Click';
  @Input() allowWrapText = false;
  @Input() disable?: boolean;
  @Input() routerLink?: string | any[];

  @Output() clicked = new EventEmitter<void>();

  getbuttonClasses(): string {
    let className = 'btn ' + this.type;
    if (this.allowWrapText) className += ' wrap-text';
    else className += ' one-line-text';

    return className;
  }
}
