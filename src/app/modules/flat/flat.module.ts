import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlatRoutingModule } from './flat-routing.module';
import { MyFlatListComponent } from './my-flat-list/my-flat-list.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';
import { FlatDetailsComponent } from './flat-details/flat-details.component';
import { IconModule } from '../../core/icons/icon.module';
import { PipeModule } from '../../pipes/pipes.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MaintenanceLogsComponent } from './maintenance-logs/maintenance-logs.component';
import { FilterModule } from '../../core/filter/filter.module';
import { ConfigureTenantComponent } from './configure-tenant/configure-tenant.component';


@NgModule({
  declarations: [
    MyFlatListComponent,
    FlatDetailsComponent,
    MaintenanceLogsComponent,
    ConfigureTenantComponent
  ],
  imports: [
    CommonModule,
    FlatRoutingModule,
    LayoutModule,
    UiModule,
    IconModule,
    DirectiveModule,
    PipeModule,
    ReactiveFormsModule,
    FilterModule
  ]
})
export class FlatModule { }
