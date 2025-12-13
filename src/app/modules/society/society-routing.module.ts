import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocietyListComponent } from './society-list/society-list.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  },
  {
    path: 'list',
    component: SocietyListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocietyRoutingModule { }
