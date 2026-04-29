import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyFlatListComponent } from './my-flat-list/my-flat-list.component';
import { FlatDetailsComponent } from './flat-details/flat-details.component';
import { MaintenanceLogsComponent } from './maintenance-logs/maintenance-logs.component';
import { PERMISSIONS } from '../../constants';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  },
  {
    path: 'list',
    // canActivate: [PermissionGuard],
    component: MyFlatListComponent,
    // data: { permission: PERMISSIONS.society_view }
  },
  {
    path: ':societyId/list',
    // canActivate: [PermissionGuard],
    component: MyFlatListComponent,
    // data: { permission: PERMISSIONS.society_view }
  },
  {
    path: 'details/:flatMemberId',
    // canActivate: [PermissionGuard],
    component: FlatDetailsComponent,
    // data: { permission: PERMISSIONS.flat_manage }
  },
  {
    path: 'logs/:id',
    component: MaintenanceLogsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlatRoutingModule { }
