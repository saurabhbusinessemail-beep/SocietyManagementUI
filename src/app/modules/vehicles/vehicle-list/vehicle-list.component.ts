import { Component, OnDestroy, OnInit } from '@angular/core';
import { ListBase } from '../../../directives/list-base.directive';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from '../../../services/dialog.service';
import { IVehicle } from '../../../interfaces';

interface IVehicleFilter {
  flatId?: string
}

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss'
})
export class VehicleListComponent extends ListBase implements OnInit, OnDestroy {

  flatId?: string;
  vehicles: IVehicle[] = [];

  isFlatMember: boolean = false;

  constructor(
    private route: ActivatedRoute,
    dialogService: DialogService,

  ) {
    super(dialogService);
  }

  ngOnInit() {
    this.flatId = this.route.snapshot.paramMap.get('flatId')!;
  }

  loadFlatParking(selectedFilter: IVehicleFilter) {
    if (!this.flatId) return;


  }

  deleteOneRecord(id: string) {
    return of({})
  }

  refreshList() {

  }

  ngOnDestroy() {
  }
}
