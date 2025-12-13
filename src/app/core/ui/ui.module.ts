import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBoxComponent } from './text-box/text-box.component';
import { FormsModule } from '@angular/forms';
import { DropDownComponent } from './drop-down/drop-down.component';



@NgModule({
  declarations: [
    TextBoxComponent,
    DropDownComponent
  ],
  imports: [
    CommonModule, FormsModule
  ],
  exports: [TextBoxComponent, DropDownComponent]
})
export class UiModule { }
