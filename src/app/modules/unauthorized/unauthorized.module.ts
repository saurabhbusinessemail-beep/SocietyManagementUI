import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { UnauthorizedRoutingModule } from './unauthorized-routing.module';
import { UnauthorizedComponent } from './unauthorized.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { LogoutComponent } from './logout/logout.component';


@NgModule({
  declarations: [
    UnauthorizedComponent,
    LogoutComponent
  ],
  imports: [
    CommonModule,
    UnauthorizedRoutingModule,
    LayoutModule,
    TranslateModule.forChild()
  ]
})
export class UnauthorizedModule { }
