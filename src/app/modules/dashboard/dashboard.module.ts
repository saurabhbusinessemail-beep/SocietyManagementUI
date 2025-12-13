import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { AdminComponent } from './admin/admin.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiModule } from '../../core/ui/ui.module';


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
    UiModule
  ]
})
export class DashboardModule { }
