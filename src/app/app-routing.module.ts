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
    path: 'profile',
    loadChildren: () => import('./modules/profile/profile.module').then(module => module.ProfileModule),
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
    path: 'gatepass',
    loadChildren: () => import('./modules/gate-pass/gate-pass.module').then(module => module.GatePassModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'gateentry',
    loadChildren: () => import('./modules/gate-entry/gate-entry.module').then(module => module.GateEntryModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'visitors',
    loadChildren: () => import('./modules/visitor/visitor.module').then(module => module.VisitorModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'vehicle',
    loadChildren: () => import('./modules/vehicles/vehicles.module').then(module => module.VehiclesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tenants',
    loadChildren: () => import('./modules/tenant/tenant.module').then(module => module.TenantModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'members',
    loadChildren: () => import('./modules/members/members.module').then(module => module.MembersModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'announcements',
    loadChildren: () => import('./modules/announcements/announcements.module').then(module => module.AnnouncementsModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'user',
    loadChildren: () => import('./modules/user/user.module').then(module => module.UserModule)
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
