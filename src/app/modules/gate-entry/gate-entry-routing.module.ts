import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GateEntryListComponent } from './gate-entry-list/gate-entry-list.component';
import { AddGateEntryComponent } from './add-gate-entry/add-gate-entry.component';
import { SecurityComponent } from './security/security.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  },
  {
    path: 'list',
    component: GateEntryListComponent
  },
  {
    path: 'add',
    component: AddGateEntryComponent
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
export class GateEntryRoutingModule { }
