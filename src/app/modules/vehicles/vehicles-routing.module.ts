import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleListComponent } from './vehicle-list/vehicle-list.component';
import { AddVehicleComponent } from './add-vehicle/add-vehicle.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: VehicleListComponent
  },
  {
    path: 'add',
    component: AddVehicleComponent
  },
  {
    path: ':flatId/list',
    component: VehicleListComponent
  },
  {
    path: ':flatId/add',
    component: AddVehicleComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiclesRoutingModule { }
