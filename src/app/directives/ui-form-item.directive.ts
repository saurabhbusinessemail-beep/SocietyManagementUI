import { Directive, Input, HostBinding } from '@angular/core';

@Directive({
  selector: '[smColumns],[mdColumns],[lgColumns]'
})
export class UIFormDirective {

  @Input() smColumns = 12;
  @Input() mdColumns = 12;
  @Input() lgColumns = 12;

  @HostBinding('class.ui-col') baseClass = true;

  @HostBinding('class') get responsiveClasses(): string {
    return [
      `ui-col-sm-${this.smColumns}`,
      `ui-col-md-${this.mdColumns}`,
      `ui-col-lg-${this.lgColumns}`
    ].join(' ');
  }
}
