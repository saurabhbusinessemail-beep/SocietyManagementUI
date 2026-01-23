import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MembersRoutingModule } from './members-routing.module';
import { MembersListComponent } from './members-list/members-list.component';
import { AddMemberComponent } from './add-member/add-member.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterModule } from '../../core/filter/filter.module';
import { IconModule } from '../../core/icons/icon.module';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';
import { PipeModule } from '../../pipes/pipes.module';


@NgModule({
  declarations: [
    MembersListComponent,
    AddMemberComponent
  ],
  imports: [
    CommonModule,
    MembersRoutingModule,
    LayoutModule,
    UiModule,
    DirectiveModule,
    FormsModule,
    ReactiveFormsModule,
    PipeModule,
    IconModule,
    FilterModule
  ]
})
export class MembersModule { }
