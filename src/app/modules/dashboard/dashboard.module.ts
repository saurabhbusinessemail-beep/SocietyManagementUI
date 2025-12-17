import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { AdminComponent } from './admin/admin.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiModule } from '../../core/ui/ui.module';
import { UserSearchModule } from '../../core/user-search/user-search.module';
import { ContactSearchModule } from '../../core/contact-search/contact-search.module';
import { LocationSearchModule } from '../../core/location-search/location-search.module';


@NgModule({
  declarations: [
    AdminComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    UiModule,
    UserSearchModule,
    ContactSearchModule,
    LocationSearchModule
  ]
})
export class DashboardModule { }
