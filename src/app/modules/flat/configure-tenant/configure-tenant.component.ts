import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { IFlat, IFlatMemberWithResidency } from '../../../interfaces';
import { take } from 'rxjs';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-configure-tenant',
  templateUrl: './configure-tenant.component.html',
  styleUrls: ['./configure-tenant.component.scss']
})
export class ConfigureTenantComponent implements OnInit {
  flatMemberId!: string;
  flatMember?: IFlatMemberWithResidency;
  loading = true;
  saving = false;
  isMultiTenantAllowed = false;
  originalIsMultiTenantAllowed = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public societyService: SocietyService,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.flatMemberId = this.route.snapshot.paramMap.get('flatMemberId')!;
    if (this.flatMemberId) {
      this.loadFlatMember();
    }
  }

  loadFlatMember() {
    this.loading = true;
    this.societyService.getFlatMemberDetails(this.flatMemberId)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.flatMember = res;
          const flat = this.getFlat();
          if (flat) {
            this.isMultiTenantAllowed = flat.isMultiTenantAllowed || false;
            this.originalIsMultiTenantAllowed = this.isMultiTenantAllowed;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  getFlat(): IFlat | undefined {
    if (this.flatMember && typeof this.flatMember.flatId !== 'string') {
      return this.flatMember.flatId as IFlat;
    }
    return undefined;
  }

  async saveConfig() {
    const flatId = this.getFlat()?._id;
    if (!flatId) return;

    const flat = this.getFlat();
    if (this.originalIsMultiTenantAllowed && !this.isMultiTenantAllowed && flat?.residingType === 'Tenant') {
      if (!await this.dialogService.confirmToProceed('You are switching to Single Tenant mode. All currently active tenants and their members will be automatically moved out to reset the flat state. Do you want to proceed?')) {
        return;
      }
    }

    this.saving = true;
    this.societyService.updateFlat(flatId, { isMultiTenantAllowed: this.isMultiTenantAllowed })
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.saving = false;
          this.router.navigate(['/myflats/details', this.flatMemberId]);
        },
        error: (err) => {
          console.error(err);
          this.saving = false;
        }
      });
  }

  setSetting(value: boolean) {
    this.isMultiTenantAllowed = value;
  }
}
