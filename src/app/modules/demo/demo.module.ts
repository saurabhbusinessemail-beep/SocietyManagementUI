import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoRoutingModule } from './demo-routing.module';
import { BookDemoComponent } from './book-demo/book-demo.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DemoListComponent } from './demo-list/demo-list.component';
import { ModalComponent } from './modal/modal.component';
import { PipeModule } from '../../pipes/pipes.module';


@NgModule({
  declarations: [
    BookDemoComponent,
    DemoListComponent,
    ModalComponent
  ],
  imports: [
    CommonModule,
    DemoRoutingModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    PipeModule
  ]
})
export class DemoModule { }
