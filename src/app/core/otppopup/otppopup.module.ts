import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OTPPopupComponent } from './otppopup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectiveModule } from '../../directives/directive.module';
import { LayoutModule } from '../layout/layout.module';
import { UiModule } from '../ui/ui.module';



@NgModule({
  declarations: [
    OTPPopupComponent
  ],
  imports: [
    CommonModule,
    LayoutModule,
    UiModule,
    DirectiveModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class OTPPopupModule { }
