import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserNamePopupRoutingModule } from './user-name-popup-routing.module';
import { UserNameInputPopupComponent } from './user-name-input-popup.component';
import { LayoutModule } from '../layout/layout.module';
import { UiModule } from '../ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    UserNameInputPopupComponent
  ],
  imports: [
    CommonModule,
    UserNamePopupRoutingModule,
    LayoutModule,
    UiModule,
    DirectiveModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class UserNamePopupModule { }
