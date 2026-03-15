import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookDemoComponent } from './book-demo/book-demo.component';
import { DemoListComponent } from './demo-list/demo-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'book',
    pathMatch: 'full'
  },
  {
    path: 'book',
    component: BookDemoComponent
  },
  {
    path: 'list',
    component: DemoListComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemoRoutingModule { }
