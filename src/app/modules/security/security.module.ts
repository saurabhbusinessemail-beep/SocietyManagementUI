import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecurityRoutingModule } from './security-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { SecurityComponent } from './security/security.component';
import { DirectiveModule } from '../../directives/directive.module';
import { QRScannerComponent } from './qrscanner/qrscanner.component';


@NgModule({
  declarations: [
    SecurityComponent,
    QRScannerComponent
  ],
  imports: [
    CommonModule,
    SecurityRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    UiModule,
    DirectiveModule
  ]
})
export class SecurityModule { }
