import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlatRoutingModule } from './flat-routing.module';
import { MyFlatListComponent } from './my-flat-list/my-flat-list.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';
import { FlatDetailsComponent } from './flat-details/flat-details.component';
import { IconModule } from '../../core/icons/icon.module';


@NgModule({
  declarations: [
    MyFlatListComponent,
    FlatDetailsComponent
  ],
  imports: [
    CommonModule,
    FlatRoutingModule,
    LayoutModule,
    UiModule,
    IconModule,
    DirectiveModule
  ]
})
export class FlatModule { }
