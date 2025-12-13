import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBoxComponent } from './text-box/text-box.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    TextBoxComponent
  ],
  imports: [
    CommonModule, FormsModule
  ],
  exports: [TextBoxComponent]
})
export class UiModule { }
