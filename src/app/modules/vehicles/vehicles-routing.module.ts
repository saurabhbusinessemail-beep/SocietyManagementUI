import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleListComponent } from './vehicle-list/vehicle-list.component';
import { AddVehicleComponent } from './add-vehicle/add-vehicle.component';

const routes: Routes = [
  {
    path: ':flatId',
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
