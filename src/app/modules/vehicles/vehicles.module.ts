import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehiclesRoutingModule } from './vehicles-routing.module';
import { VehicleListComponent } from './vehicle-list/vehicle-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterModule } from '../../core/filter/filter.module';
import { IconModule } from '../../core/icons/icon.module';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';
import { PipeModule } from '../../pipes/pipes.module';


@NgModule({
  declarations: [
    VehicleListComponent,
  ],
  imports: [
    CommonModule,
    VehiclesRoutingModule,
    LayoutModule,
    UiModule,
    DirectiveModule,
    FormsModule,
    ReactiveFormsModule,
    PipeModule,
    IconModule,
    FilterModule
  ]
})
export class VehiclesModule { }
