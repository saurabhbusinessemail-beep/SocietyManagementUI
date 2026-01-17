import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VisitorRoutingModule } from './visitor-routing.module';
import { VisitorListComponent } from './visitor-list/visitor-list.component';
import { IconModule } from '../../core/icons/icon.module';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterModule } from '../../core/filter/filter.module';


@NgModule({
  declarations: [
    VisitorListComponent
  ],
  imports: [
    CommonModule,
    VisitorRoutingModule,
    LayoutModule,
    UiModule,
    DirectiveModule,
    IconModule,
    FormsModule,
    ReactiveFormsModule,
    FilterModule
  ]
})
export class VisitorModule { }
