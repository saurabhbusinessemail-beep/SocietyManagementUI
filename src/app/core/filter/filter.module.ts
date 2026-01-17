import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent } from './filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectiveModule } from '../../directives/directive.module';
import { UiModule } from '../ui/ui.module';
import { LayoutModule } from '../layout/layout.module';
import { IconModule } from '../icons/icon.module';
import { PipeModule } from '../../pipes/pipes.module';



@NgModule({
  declarations: [
    FilterComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DirectiveModule,
    UiModule,
    LayoutModule,
    IconModule,
    PipeModule
  ],
  exports: [FilterComponent]
})
export class FilterModule { }
