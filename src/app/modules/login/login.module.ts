import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PipeModule } from '../../pipes/pipes.module';
import { IconModule } from '../../core/icons/icon.module';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';
import { LoginPopupModule } from '../../core/login-popup/login-popup.module';
import { PricingModule } from '../../core/pricing/pricing.module';


@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    LoginRoutingModule,
    IconModule,
    FormsModule,
    ReactiveFormsModule,
    PipeModule,
    LayoutModule,
    UiModule,
    DirectiveModule,
    LoginPopupModule,
    PricingModule,
  ]
})
export class LoginModule { }
