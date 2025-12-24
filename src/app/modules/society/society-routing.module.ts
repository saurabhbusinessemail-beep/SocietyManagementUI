import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocietyListComponent } from './society-list/society-list.component';
import { AddSocietyComponent } from './add-society/add-society.component';
import { SocietyDetailsComponent } from './society-details/society-details.component';
import { PermissionGuard } from '../../guard/permission.guard';
import { PERMISSIONS } from '../../constants';
import { SocietyManagersComponent } from './society-managers/society-managers.component';

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
    path: 'edit/:id',
    canActivate: [PermissionGuard],
    component: AddSocietyComponent,
    data: { permission: PERMISSIONS.society_update, withId: 'societyId' }
  },
  {
    path: 'details/:id',
    component: SocietyDetailsComponent,
    data: { permission: PERMISSIONS.society_view, withId: 'societyId' }
  },
  {
    path: 'managers/:id',
    component: SocietyManagersComponent,
    data: { permission: PERMISSIONS.society_adminContact_view, withId: 'societyId' }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocietyRoutingModule { }
