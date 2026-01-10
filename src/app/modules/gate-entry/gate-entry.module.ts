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
    ReactiveFormsModule,
    LayoutModule,
    UiModule,
    DirectiveModule
  ]
})
export class GateEntryModule { }
