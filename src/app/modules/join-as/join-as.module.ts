import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JoinAsRoutingModule } from './join-as-routing.module';
import { JoinAsComponent } from './join-as/join-as.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';


@NgModule({
  declarations: [
    JoinAsComponent
  ],
  imports: [
    CommonModule,
    JoinAsRoutingModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    UiModule,
    DirectiveModule
  ]
})
export class JoinAsModule { }
