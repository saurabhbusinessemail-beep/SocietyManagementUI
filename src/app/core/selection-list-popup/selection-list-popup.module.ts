import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionListPopupComponent } from './selection-list-popup.component';
import { IconModule } from '../icons/icon.module';



@NgModule({
  declarations: [
    SelectionListPopupComponent
  ],
  imports: [
    CommonModule,
    IconModule
  ]
})
export class SelectionListPopupModule { }
