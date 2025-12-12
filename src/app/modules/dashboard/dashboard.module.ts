import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { AdminComponent } from './admin/admin.component';
import { HeaderModule } from '../../core/header/header.module';
import { MenuModule } from '../../core/menu/menu.module';
import { FooterModule } from '../../core/footer/footer.module';
import { BodyModule } from '../../core/body/body.module';


@NgModule({
  declarations: [
    AdminComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    HeaderModule,
    MenuModule,
    FooterModule,
    BodyModule
  ]
})
export class DashboardModule { }
