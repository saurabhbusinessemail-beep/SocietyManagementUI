import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { UserRoutingModule } from './user-routing.module';
import { UserManagementComponent } from './user-management/user-management.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiModule } from '../../core/ui/ui.module';
import { UserMenuPageComponent } from './user-menu-page/user-menu-page.component';
import { IconModule } from '../../core/icons/icon.module';
import { TourModule } from '../../core/tour/tour.module';


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
    IconModule,
    TourModule,
    TranslateModule.forChild()
  ]
})
export class UserModule { }
