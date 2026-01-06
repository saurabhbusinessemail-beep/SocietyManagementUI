import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./modules/login/login.module').then(module => module.LoginModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module').then(module => module.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'society',
    loadChildren: () => import('./modules/society/society.module').then(module => module.SocietyModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'myflats',
    loadChildren: () => import('./modules/flat/flat.module').then(module => module.FlatModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'complaints',
    loadChildren: () => import('./modules/complaint/complaint.module').then(module => module.ComplaintModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'unauthorized',
    loadChildren: () => import('./modules/unauthorized/unauthorized.module').then(module => module.UnauthorizedModule)
  },
  {
    path: '**',
    loadChildren: () => import('./modules/page-not-found/page-not-found.module').then(module => module.PageNotFoundModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
