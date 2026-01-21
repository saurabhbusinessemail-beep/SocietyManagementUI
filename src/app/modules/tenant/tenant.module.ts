import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TenantRoutingModule } from './tenant-routing.module';
import { TenantListComponent } from './tenant-list/tenant-list.component';
import { AddTenantComponent } from './add-tenant/add-tenant.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterModule } from '../../core/filter/filter.module';
import { IconModule } from '../../core/icons/icon.module';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';


@NgModule({
  declarations: [
    TenantListComponent,
    AddTenantComponent
  ],
  imports: [
    CommonModule,
    TenantRoutingModule,
    LayoutModule,
    UiModule,
    DirectiveModule,
    IconModule,
    FormsModule,
    ReactiveFormsModule,
    FilterModule
  ]
})
export class TenantModule { }
