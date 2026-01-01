import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlatRoutingModule } from './flat-routing.module';
import { MyFlatListComponent } from './my-flat-list/my-flat-list.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';


@NgModule({
  declarations: [
    MyFlatListComponent
  ],
  imports: [
    CommonModule,
    FlatRoutingModule,
    LayoutModule,
    UiModule,
    DirectiveModule
  ]
})
export class FlatModule { }
