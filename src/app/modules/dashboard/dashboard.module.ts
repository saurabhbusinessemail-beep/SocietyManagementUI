import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { AdminComponent } from './admin/admin.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';
import { UserComponent } from './user/user.component';
import { IconModule } from '../../core/icons/icon.module';
import { SecurityComponent } from './security/security.component';


@NgModule({
  declarations: [
    AdminComponent,
    UserComponent,
    SecurityComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    UiModule,
    DirectiveModule,
    IconModule
  ]
})
export class DashboardModule { }
