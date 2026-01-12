import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIFormDirective } from './ui-form-item.directive';
import { PopupAnimatorDirective } from './popup-animator.directive';



@NgModule({
  declarations: [UIFormDirective, PopupAnimatorDirective],
  imports: [
    CommonModule,
  ],
  exports: [UIFormDirective, PopupAnimatorDirective]
})
export class DirectiveModule { }
