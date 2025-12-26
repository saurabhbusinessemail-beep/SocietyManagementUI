import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocietyListComponent } from './society-list/society-list.component';
import { AddSocietyComponent } from './add-society/add-society.component';
import { SocietyDetailsComponent } from './society-details/society-details.component';
import { PermissionGuard } from '../../guard/permission.guard';
import { PERMISSIONS } from '../../constants';
import { SocietyManagersComponent } from './society-managers/society-managers.component';
import { BuildingListComponent } from './building-list/building-list.component';
import { FlatListComponent } from './flat-list/flat-list.component';

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
    path: ':id/edit',
    canActivate: [PermissionGuard],
    component: AddSocietyComponent,
    data: { permission: PERMISSIONS.society_update, checkSocietyId: true }
  },
  {
    path: ':id/details',
    canActivate: [PermissionGuard],
    component: SocietyDetailsComponent,
    data: { permission: PERMISSIONS.society_view, checkSocietyId: true }
  },
  {
    path: ':id/managers',
    canActivate: [PermissionGuard],
    component: SocietyManagersComponent,
    data: { permission: PERMISSIONS.society_adminContact_view, checkSocietyId: true }
  },
  {
    path: ':id/buildings',
    canActivate: [PermissionGuard],
    component: BuildingListComponent,
    data: { permission: PERMISSIONS.building_view, checkSocietyId: true }
  },
  {
    path: ':id/flats',
    canActivate: [PermissionGuard],
    component: FlatListComponent,
    data: { permission: PERMISSIONS.flat_view, checkSocietyId: true }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocietyRoutingModule { }
