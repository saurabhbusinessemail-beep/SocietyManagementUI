import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UnauthorizedRoutingModule } from './unauthorized-routing.module';
import { UnauthorizedComponent } from './unauthorized.component';
import { LayoutModule } from '../../core/layout/layout.module';


@NgModule({
  declarations: [
    UnauthorizedComponent
  ],
  imports: [
    CommonModule,
    UnauthorizedRoutingModule,
    LayoutModule
  ]
})
export class UnauthorizedModule { }
