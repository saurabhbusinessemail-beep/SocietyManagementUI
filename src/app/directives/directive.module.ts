import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIFormDirective } from './ui-form-item.directive';
import { PopupAnimatorDirective } from './popup-animator.directive';
import { LoadingOverlayDirective } from './loading-overlay.directive';
import { LongTouchDirective } from './long-touch.directive';
import { RestrictHeightDirective } from './app-restrict-height.directive';



@NgModule({
  declarations: [UIFormDirective, PopupAnimatorDirective, LoadingOverlayDirective, LongTouchDirective, RestrictHeightDirective],
  imports: [
    CommonModule,
  ],
  exports: [UIFormDirective, PopupAnimatorDirective, LoadingOverlayDirective, LongTouchDirective, RestrictHeightDirective]
})
export class DirectiveModule { }
