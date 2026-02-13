import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserManagementComponent } from './user-management/user-management.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiModule } from '../../core/ui/ui.module';


@NgModule({
  declarations: [
    UserManagementComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    UiModule
  ]
})
export class UserModule { }
