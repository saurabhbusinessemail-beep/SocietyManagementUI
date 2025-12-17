import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIFormDirective } from './ui-form-item.directive';



@NgModule({
  declarations: [UIFormDirective],
  imports: [
    CommonModule,
  ],
  exports: [UIFormDirective]
})
export class DirectiveModule { }
