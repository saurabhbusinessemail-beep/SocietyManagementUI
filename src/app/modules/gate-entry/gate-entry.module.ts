import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GateEntryRoutingModule } from './gate-entry-routing.module';
import { GateEntryListComponent } from './gate-entry-list/gate-entry-list.component';
import { AddGateEntryComponent } from './add-gate-entry/add-gate-entry.component';
import { SecurityComponent } from './security/security.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';
import { QRScannerComponent } from './qrscanner/qrscanner.component';
import { IconModule } from '../../core/icons/icon.module';
import { OTPPopupModule } from '../../core/otppopup/otppopup.module';
import { ConfirmationPopupModule } from '../../core/confirmation/confirmation-popup.module';


@NgModule({
  declarations: [
    GateEntryListComponent,
    AddGateEntryComponent,
    SecurityComponent,
    QRScannerComponent
  ],
  imports: [
    CommonModule,
    GateEntryRoutingModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    UiModule,
    DirectiveModule,
    IconModule,
    ConfirmationPopupModule,
    OTPPopupModule
  ]
})
export class GateEntryModule { }
