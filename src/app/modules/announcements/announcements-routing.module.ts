import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnnouncementListComponent } from './announcement-list/announcement-list.component';
import { AddAnnouncementComponent } from './add-announcement/add-announcement.component';
import { AnnouncementDetailsComponent } from './announcement-details/announcement-details.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  },
  {
    path: 'list',
    component: AnnouncementListComponent,
  },
  {
    path: 'add',
    component: AddAnnouncementComponent,
  },
  {
    path: 'edit/:id',
    component: AddAnnouncementComponent,
  },
  {
    path: ':id',
    component: AnnouncementDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnnouncementsRoutingModule { }
