import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocietyRoutingModule } from './society-routing.module';
import { SocietyListComponent } from './society-list/society-list.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { AddSocietyComponent } from './add-society/add-society.component';
import { DirectiveModule } from '../../directives/directive.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconModule } from '../../core/icons/icon.module';
import { SocietyDetailsComponent } from './society-details/society-details.component';
import { SocietyManagersComponent } from './society-managers/society-managers.component';
import { BuildingListComponent } from './building-list/building-list.component';
import { FlatListComponent } from './flat-list/flat-list.component';
import { PipeModule } from '../../pipes/pipes.module';
import { ParkingsListComponent } from './parkings-list/parkings-list.component';
import { MatDialogContent } from "@angular/material/dialog";
import { SocietyAdminsComponent } from './society-admins/society-admins.component';
import { PendingSocietyApprovalsComponent } from './pending-society-approvals/pending-society-approvals.component';
import { CurrentPlanComponent } from './current-plan/current-plan.component';
import { PlanHistoryComponent } from './plan-history/plan-history.component';
import { PendingApprovalComponent } from './pending-approval/pending-approval.component';
import { MatTabsModule } from '@angular/material/tabs';
import { PendingFlatApprovalsComponent } from './pending-flat-approvals/pending-flat-approvals.component';



@NgModule({
  declarations: [
    SocietyListComponent,
    AddSocietyComponent,
    SocietyDetailsComponent,
    SocietyManagersComponent,
    BuildingListComponent,
    FlatListComponent,
    ParkingsListComponent,
    SocietyAdminsComponent,
    PendingSocietyApprovalsComponent,
    CurrentPlanComponent,
    PlanHistoryComponent,
    PendingApprovalComponent,
    PendingFlatApprovalsComponent
  ],
  imports: [
    CommonModule,
    SocietyRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    UiModule,
    IconModule,
    DirectiveModule,
    PipeModule,
    MatDialogContent,
    MatTabsModule
  ]
})
export class SocietyModule { }
