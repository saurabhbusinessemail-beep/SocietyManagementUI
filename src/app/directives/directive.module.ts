import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIFormDirective } from './ui-form-item.directive';
import { PopupAnimatorDirective } from './popup-animator.directive';
import { LoadingOverlayDirective } from './loading-overlay.directive';
import { LongTouchDirective } from './long-touch.directive';



@NgModule({
  declarations: [UIFormDirective, PopupAnimatorDirective, LoadingOverlayDirective, LongTouchDirective],
  imports: [
    CommonModule,
  ],
  exports: [UIFormDirective, PopupAnimatorDirective, LoadingOverlayDirective, LongTouchDirective]
})
export class DirectiveModule { }
