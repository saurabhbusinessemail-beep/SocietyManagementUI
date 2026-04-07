import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JoinAsComponent } from './join-as/join-as.component';

const routes: Routes = [
  {
    path: ':role',
    component: JoinAsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JoinAsRoutingModule { }
