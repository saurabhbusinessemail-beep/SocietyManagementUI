import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationPopupComponent } from './confirmation-popup.component';
import { UiModule } from "../ui/ui.module";
import { IconModule } from "../icons/icon.module";



@NgModule({
  declarations: [
    ConfirmationPopupComponent
  ],
  imports: [
    CommonModule,
    UiModule,
    IconModule
],
exports: [ConfirmationPopupComponent]
})
export class ConfirmationPopupModule { }
