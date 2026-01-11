import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRViewerComponent } from './qrviewer.component';
import { QRCodeModule } from 'angularx-qrcode';
import { UiModule } from '../ui/ui.module';
import { LayoutModule } from "../layout/layout.module";
import { DirectiveModule } from "../../directives/directive.module";
import { IconModule } from "../icons/icon.module";



@NgModule({
  declarations: [
    QRViewerComponent
  ],
  imports: [
    CommonModule,
    QRCodeModule,
    UiModule,
    LayoutModule,
    DirectiveModule,
    IconModule
]
})
export class QRViewerModule { }
