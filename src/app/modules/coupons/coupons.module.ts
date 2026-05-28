import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { CouponsRoutingModule } from './coupons-routing.module';
import { CouponsListComponent } from './coupons-list/coupons-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '../../core/layout/layout.module';


@NgModule({
  declarations: [
    CouponsListComponent
  ],
  imports: [
    CommonModule,
    CouponsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    TranslateModule.forChild()
  ]
})
export class CouponsModule { }
