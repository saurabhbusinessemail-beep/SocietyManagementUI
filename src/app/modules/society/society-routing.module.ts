import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SocietyListComponent } from './society-list/society-list.component';
import { AddSocietyComponent } from './add-society/add-society.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SocietyRoutingModule { }
