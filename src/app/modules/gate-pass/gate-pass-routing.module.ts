import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GatePassListComponent } from './gate-pass-list/gate-pass-list.component';
import { AddGatePassComponent } from './add-gate-pass/add-gate-pass.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  },
  {
    path: 'list',
    component: GatePassListComponent
  },
  {
    path: 'add',
    component: AddGatePassComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GatePassRoutingModule { }
