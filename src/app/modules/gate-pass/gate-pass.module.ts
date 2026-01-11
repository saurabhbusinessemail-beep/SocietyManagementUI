import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GatePassRoutingModule } from './gate-pass-routing.module';
import { GatePassListComponent } from './gate-pass-list/gate-pass-list.component';
import { AddGatePassComponent } from './add-gate-pass/add-gate-pass.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';
import { IconModule } from "../../core/icons/icon.module";
import { QRViewerModule } from '../../core/qrviewer/qrviewer.module';


@NgModule({
  declarations: [
    GatePassListComponent,
    AddGatePassComponent
  ],
  imports: [
    CommonModule,
    GatePassRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    UiModule,
    DirectiveModule,
    IconModule,
    QRViewerModule
]
})
export class GatePassModule { }
