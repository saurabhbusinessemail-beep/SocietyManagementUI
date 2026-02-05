import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnnouncementListComponent } from './announcement-list/announcement-list.component';
import { AddAnnouncementComponent } from './add-announcement/add-announcement.component';

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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnnouncementsRoutingModule { }
