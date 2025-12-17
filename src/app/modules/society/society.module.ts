import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocietyRoutingModule } from './society-routing.module';
import { SocietyListComponent } from './society-list/society-list.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { AddSocietyComponent } from './add-society/add-society.component';
import { DirectiveModule } from '../../directives/directive.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconModule } from '../../core/icons/icon.module';



@NgModule({
  declarations: [
  
    SocietyListComponent,
        AddSocietyComponent
  ],
  imports: [
    CommonModule,
    SocietyRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    UiModule,
    IconModule,
    DirectiveModule
  ]
})
export class SocietyModule { }
