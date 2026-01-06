import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComplaintListComponent } from './complaint-list/complaint-list.component';
import { ComplaintFilterComponent } from './complaint-filter/complaint-filter.component';
import { AddComplaintComponent } from './add-complaint/add-complaint.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  },
  {
    path: 'list',
    component: ComplaintListComponent,
  },
  {
    path: 'filter',
    component: ComplaintFilterComponent,
  },
  {
    path: 'add',
    component: AddComplaintComponent,
  },
  {
    path: 'add',
    component: AddComplaintComponent,
  },
  {
    path: ':id/add',
    component: AddComplaintComponent,
  },
  {
    path: ':id/add/:flatId',
    component: AddComplaintComponent,
  },
  {
    path: 'add/:flatId',
    component: AddComplaintComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComplaintRoutingModule { }
