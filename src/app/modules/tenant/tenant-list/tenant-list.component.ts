import { Component, OnInit } from '@angular/core';
import { Subject, take } from 'rxjs';
import { IFlatMember } from '../../../interfaces';
import { SocietyService } from '../../../services/society.service';
import { DialogService } from '../../../services/dialog.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  tenants: IFlatMember[] = [];
  routeFlatId?: string;

  loadingTenants = true;
  loadingTenantAction: { [tenantId: string]: boolean } = {};

  constructor(public societyService: SocietyService, private dialogService: DialogService,
    private route: ActivatedRoute, private router: Router
  ) { }

  ngOnInit(): void {
    this.routeFlatId = this.route.snapshot.paramMap.get('flatId') ?? '';
  }

  loadTenants(selectedFIlter: ITenantsFilter) {
    this.selectedFIlter = selectedFIlter;
    const societyId = selectedFIlter.societyId;
    const flatId = selectedFIlter.flatId;
    this.tenants = [];
    this.loadingTenants = true;

    this.societyService.myTenants(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.tenants = response.data;
          this.loadingTenants = false;
        },
        error: err => {
          this.loadingTenants = false;
        }
      });
  }

  async deleteTenant(tenant: IFlatMember) {
    const forUser = !tenant.userId || typeof tenant.userId === 'string' ? undefined : ` ${tenant.userId.name ?? tenant.userId.phoneNumber}`
    if (!await this.dialogService.confirmDelete('Delete Tenant', `Are you sure you want to delete tenant ${forUser}?`)) return;
    
    this.loadingTenantAction[tenant._id] = true;
    this.societyService.deleteFlatMember(tenant._id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadTenants(this.selectedFIlter)
          this.loadingTenantAction[tenant._id] = false;
        },
        error: err => this.loadingTenantAction[tenant._id] = false
      });
  }

  moveOut(tenant: IFlatMember, dt: Date) {
    this.loadingTenantAction[tenant._id] = true;
    this.societyService.moveOutTenant(tenant._id, dt)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.loadingTenantAction[tenant._id] = false;
          // if (!response.success || !response.data) return;

          // tenant.leaseEnd = response.data.leaseEnd;
          this.loadTenants(this.selectedFIlter)
        },
        error: err => {
          this.loadingTenantAction[tenant._id] = false;
        }
      })
  }

  moveIn(tenant: IFlatMember) {
    this.loadingTenantAction[tenant._id] = true;
    this.societyService.moveInTenant(tenant._id)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.loadingTenantAction[tenant._id] = false;
          // if (!response.success || !response.data) return;

          // tenant.leaseEnd = response.data.leaseEnd;
          this.loadTenants(this.selectedFIlter)
        },
        error: err => {
          this.loadingTenantAction[tenant._id] = false;
        }
      })
  }

  async openAddTenant() {
    console.log('this.selectedFIlter.societyId = ', this.selectedFIlter);
    const societyId = this.selectedFIlter.societyId ?? this.societyService.selectedSocietyFilterValue?.value;
    const flatId = this.routeFlatId ?? this.selectedFIlter.flatId;

    if (societyId && flatId)
      this.router.navigate(['tenants', societyId, 'add', flatId]);
    else if (societyId)
      this.router.navigate(['tenants', societyId, 'add']);
    else if (flatId)
      this.router.navigate(['tenants', 'add', flatId]);
    else
      this.router.navigate(['tenants', 'add']);
  }
}
