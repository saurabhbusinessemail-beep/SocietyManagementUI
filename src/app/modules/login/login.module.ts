import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipeModule } from '../../pipes/pipes.module';
import { IconModule } from '../../core/icons/icon.module';


@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    LoginRoutingModule,
    IconModule,
    FormsModule,
    ReactiveFormsModule,
    PipeModule
  ]
})
export class LoginModule { }
