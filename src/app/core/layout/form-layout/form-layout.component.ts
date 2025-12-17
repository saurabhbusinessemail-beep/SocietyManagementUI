import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ui-form-layout',
  templateUrl: './form-layout.component.html',
  styleUrl: './form-layout.component.scss'
})
export class FormLayoutComponent {
  // @Input() formGroup!: FormGroup | FormGroup[];

  // get groups(): FormGroup[] {
  //   return Array.isArray(this.formGroup)
  //     ? this.formGroup
  //     : [this.formGroup];
  // }
}
