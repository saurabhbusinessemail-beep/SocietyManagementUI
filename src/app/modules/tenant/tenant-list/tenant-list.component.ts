import { Component, OnInit } from '@angular/core';
import { Subject, take } from 'rxjs';
import { IFlatMember } from '../../../interfaces';
import { SocietyService } from '../../../services/society.service';

interface ITenantsFilter {
  societyId?: string, flatId?: string
}

@Component({
  selector: 'app-tenant-list',
  templateUrl: './tenant-list.component.html',
  styleUrl: './tenant-list.component.scss'
})
export class TenantListComponent implements OnInit {

  selectedFIlter: ITenantsFilter = {};
  isComponentActive = new Subject<void>();
  tenants: IFlatMember[] = [];

  constructor(private societyService: SocietyService) { }

  ngOnInit(): void {

  }

  loadTenants(selectedFIlter: ITenantsFilter) {
    this.selectedFIlter = selectedFIlter;
    const societyId = selectedFIlter.societyId;
    const flatId = selectedFIlter.flatId;

    this.societyService.myTenants(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.tenants = response.data;
        }
      });
  }

  deleteTenant(tenant: IFlatMember) {
    this.societyService.deleteFlatMember(tenant._id)
      .pipe(take(1))
      .subscribe({
        next: () => this.loadTenants(this.selectedFIlter)
      });
  }

  moveOut(tenant: IFlatMember, dt: Date) {
    this.societyService.updatedeleteFlatMemberLeaseEnd(tenant._id, dt)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success || !response.data) return;

          tenant.leaseEnd = response.data.leaseEnd;
        }
      })
  }
}
