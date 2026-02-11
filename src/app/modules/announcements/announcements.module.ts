import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnnouncementsRoutingModule } from './announcements-routing.module';
import { AnnouncementListComponent } from './announcement-list/announcement-list.component';
import { AddAnnouncementComponent } from './add-announcement/add-announcement.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterModule } from '../../core/filter/filter.module';
import { IconModule } from '../../core/icons/icon.module';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';
import { PipeModule } from '../../pipes/pipes.module';
import { AnnouncementDetailsComponent } from './announcement-details/announcement-details.component';


@NgModule({
  declarations: [
    AnnouncementListComponent,
    AddAnnouncementComponent,
    AnnouncementDetailsComponent
  ],
  imports: [
    CommonModule,
    AnnouncementsRoutingModule,
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
export class AnnouncementsModule { }
