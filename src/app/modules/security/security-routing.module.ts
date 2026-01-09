import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecurityComponent } from './security/security.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'user'
  },
  {
    path: 'dashboard',
    component: SecurityComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule { }
