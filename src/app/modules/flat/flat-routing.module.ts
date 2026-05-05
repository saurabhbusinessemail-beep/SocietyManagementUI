import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyFlatListComponent } from './my-flat-list/my-flat-list.component';
import { FlatDetailsComponent } from './flat-details/flat-details.component';
import { MaintenanceLogsComponent } from './maintenance-logs/maintenance-logs.component';
import { ConfigureTenantComponent } from './configure-tenant/configure-tenant.component';
import { RentListComponent } from './rent-list/rent-list.component';
import { RentLogsComponent } from './rent-logs/rent-logs.component';
import { TenantDocumentListComponent } from './tenant-document-list/tenant-document-list.component';
import { TenantDocumentManagerComponent } from './tenant-document-manager/tenant-document-manager.component';
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
    path: 'details/:flatMemberId/configure-tenant',
    component: ConfigureTenantComponent
  },
  {
    path: 'logs/:id',
    component: MaintenanceLogsComponent
  },
  {
    path: 'rent-list/:flatId',
    component: RentListComponent
  },
  {
    path: 'rent-logs/:id',
    component: RentLogsComponent
  },
  {
    path: 'tenant-documents/:flatId',
    component: TenantDocumentListComponent
  },
  {
    path: 'tenant-document-manager/:flatId',
    component: TenantDocumentManagerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlatRoutingModule { }
