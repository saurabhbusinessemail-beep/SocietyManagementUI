import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocietyRoutingModule } from './society-routing.module';
import { SocietyListComponent } from './society-list/society-list.component';
import { LayoutModule } from '../../core/layout/layout.module';



@NgModule({
  declarations: [
  
    SocietyListComponent
  ],
  imports: [
    CommonModule,
    SocietyRoutingModule,
    LayoutModule
  ]
})
export class SocietyModule { }
