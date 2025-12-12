import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginBlockGuard } from './guard/guards/login-block.guard';
import { AuthGuard } from './guard/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then(module => module.LoginModule),
    canActivate: [LoginBlockGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(module => module.DashboardModule),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
