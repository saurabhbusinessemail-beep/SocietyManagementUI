import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginPopupComponent } from './login-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconModule } from '../icons/icon.module';
import { PipeModule } from '../../pipes/pipes.module';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [
    LoginPopupComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconModule,
    PipeModule,
    MatDialogModule
  ]
})
export class LoginPopupModule { }
