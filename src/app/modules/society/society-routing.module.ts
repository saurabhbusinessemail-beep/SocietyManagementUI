import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocietyListComponent } from './society-list/society-list.component';
import { AddSocietyComponent } from './add-society/add-society.component';
import { SocietyDetailsComponent } from './society-details/society-details.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  },
  {
    path: 'list',
    component: SocietyListComponent
  },
  {
    path: 'add',
    component: AddSocietyComponent
  },
  {
    path: 'details/:id',
    component: SocietyDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocietyRoutingModule { }
