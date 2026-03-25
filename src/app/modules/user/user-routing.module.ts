import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserManagementComponent } from './user-management/user-management.component';
import { UserMenuPageComponent } from './user-menu-page/user-menu-page.component';

const routes: Routes = [
  { path: '', component: UserManagementComponent },
  { path: 'menu', component: UserMenuPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
