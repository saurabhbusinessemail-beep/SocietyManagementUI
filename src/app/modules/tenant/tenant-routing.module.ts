import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantListComponent } from './tenant-list/tenant-list.component';
import { AddTenantComponent } from './add-tenant/add-tenant.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  },
  {
    path: 'list',
    component: TenantListComponent
  },
  {
    path: 'add',
    component: AddTenantComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantRoutingModule { }
