import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBoxComponent } from './text-box/text-box.component';
import { FormsModule } from '@angular/forms';
import { DropDownComponent } from './drop-down/drop-down.component';
import { SearchBoxComponent } from './search-box/search-box.component';
import { IconModule } from '../icons/icon.module';



@NgModule({
  declarations: [
    TextBoxComponent,
    DropDownComponent,
    SearchBoxComponent
  ],
  imports: [
    CommonModule, FormsModule, IconModule
  ],
  exports: [TextBoxComponent, DropDownComponent, SearchBoxComponent]
})
export class UiModule { }
