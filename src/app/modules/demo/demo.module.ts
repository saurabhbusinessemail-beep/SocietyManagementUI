import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DemoRoutingModule } from './demo-routing.module';
import { BookDemoComponent } from './book-demo/book-demo.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    BookDemoComponent
  ],
  imports: [
    CommonModule,
    DemoRoutingModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class DemoModule { }
