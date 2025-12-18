import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocietyListComponent } from './society-list/society-list.component';
import { AddSocietyComponent } from './add-society/add-society.component';
import { SocietyDetailsComponent } from './society-details/society-details.component';
import { PermissionGuard } from '../../guard/permission.guard';
import { PERMISSIONS } from '../../constants';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  },
  {
    path: 'list',
    canActivate: [PermissionGuard],
    component: SocietyListComponent,
    data: { permission: PERMISSIONS.society_view }
  },
  {
    path: 'add',
    canActivate: [PermissionGuard],
    component: AddSocietyComponent,
    data: { permission: PERMISSIONS.society_add }
  },
  {
    path: 'details/:id',
    component: SocietyDetailsComponent,
    data: { permission: PERMISSIONS.society_view }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocietyRoutingModule { }
