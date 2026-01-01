import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyFlatListComponent } from './my-flat-list/my-flat-list.component';

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
    path: ':id/list',
    // canActivate: [PermissionGuard],
    component: MyFlatListComponent,
    // data: { permission: PERMISSIONS.society_view }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlatRoutingModule { }
