import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionListPopupComponent } from './selection-list-popup.component';
import { IconModule } from '../icons/icon.module';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [
    SelectionListPopupComponent
  ],
  imports: [
    CommonModule,
    IconModule,
    TranslateModule
  ]
})
export class SelectionListPopupModule { }
