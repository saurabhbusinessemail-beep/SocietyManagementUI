import { Component, OnDestroy, OnInit } from '@angular/core';
import { ListBase } from '../../../directives/list-base.directive';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss'
})
export class VehicleListComponent extends ListBase implements OnInit, OnDestroy {

  flatId?: string;

  constructor(
    private route: ActivatedRoute,
    dialogService: DialogService,
    
  ) {
    super(dialogService);
  }

  ngOnInit() {
    this.flatId = this.route.snapshot.paramMap.get('flatId')!;
  }

  loadFlatParking() {
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
