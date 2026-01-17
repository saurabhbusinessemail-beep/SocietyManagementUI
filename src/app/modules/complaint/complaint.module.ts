import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComplaintRoutingModule } from './complaint-routing.module';
import { ComplaintListComponent } from './complaint-list/complaint-list.component';
import { ComplaintFilterComponent } from './complaint-filter/complaint-filter.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddComplaintComponent } from './add-complaint/add-complaint.component';
import { PipeModule } from '../../pipes/pipes.module';
import { IconModule } from '../../core/icons/icon.module';
import { FilterModule } from '../../core/filter/filter.module';


@NgModule({
  declarations: [
    ComplaintListComponent,
    ComplaintFilterComponent,
    AddComplaintComponent
  ],
  imports: [
    CommonModule,
    ComplaintRoutingModule,
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
export class ComplaintModule { }
