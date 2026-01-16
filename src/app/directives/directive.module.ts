import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIFormDirective } from './ui-form-item.directive';
import { PopupAnimatorDirective } from './popup-animator.directive';
import { LoadingOverlayDirective } from './loading-overlay.directive';



@NgModule({
  declarations: [UIFormDirective, PopupAnimatorDirective, LoadingOverlayDirective],
  imports: [
    CommonModule,
  ],
  exports: [UIFormDirective, PopupAnimatorDirective, LoadingOverlayDirective]
})
export class DirectiveModule { }
