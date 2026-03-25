import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRoutingModule } from './user-routing.module';
import { UserManagementComponent } from './user-management/user-management.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiModule } from '../../core/ui/ui.module';
import { UserMenuPageComponent } from './user-menu-page/user-menu-page.component';
import { IconModule } from '../../core/icons/icon.module';


@NgModule({
  declarations: [
    UserManagementComponent,
    UserMenuPageComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    UiModule,
    IconModule
  ]
})
export class UserModule { }
