import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MembersListComponent } from './members-list/members-list.component';
import { AddMemberComponent } from './add-member/add-member.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'list'
  },
  {
    path: 'list',
    component: MembersListComponent,
  },
  {
    path: 'add',
    component: AddMemberComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MembersRoutingModule { }
