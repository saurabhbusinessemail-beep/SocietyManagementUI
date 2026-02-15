import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDeleteComponent } from './confirm-delete.component';



@NgModule({
  declarations: [
    ConfirmDeleteComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [ConfirmDeleteComponent]
})
export class DeleteConfirmationModule { }
