// user.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISociety } from '../../../interfaces';
import { Subject, take } from 'rxjs';
import { SocietyService } from '../../../services/society.service';
import { DashboardService } from '../../../services/dashboard.service';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';
import { IDashboardApprovals } from '../../../interfaces';
import { SocietyRoles } from '../../../types';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit, OnDestroy {

  roles: { role: string; label: string; icon: string }[] = [
    {
      role: SocietyRoles.owner,
      label: 'Flat Owner',
      icon: 'home'
    },
    {
      role: SocietyRoles.tenant,
      label: 'Tenant',
      icon: 'tenant'
    },
    {
      role: SocietyRoles.security,
      label: 'Security',
      icon: 'security'
    }
  ];

  isSocitiesLoading = false;
  societies: ISociety[] = [];

  approvals: IDashboardApprovals = {};
  isApprovalsLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private societyService: SocietyService,
    private dashboardService: DashboardService,
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSocieties();
    this.loadApprovals();
  }

  loadApprovals() {
    this.isApprovalsLoading = true;
    this.dashboardService.getPendingApprovals()
      .pipe(take(1))
      .subscribe({
        next: response => {
          const data = response.data ?? {};

          // Filter out seen gate entries for security
          console.log('data = ', data);
          if (data.gateEntries) {
            const seenIds = this.getSeenGateEntryIds();
            data.gateEntries = data.gateEntries.filter((ge: any) => !seenIds.includes(ge._id));
          }

          this.approvals = data;
          this.isApprovalsLoading = false;
        },
        error: () => {
          console.log('Error while getting approvals');
          this.isApprovalsLoading = false;
        }
      });
  }

  loadSocieties() {
    this.isSocitiesLoading = true;
    this.societyService.getAllSocieties()
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.societies = response.data ?? [];
          this.isSocitiesLoading = false;
        },
        error: () => {
          console.log('Error while getting societies');
          this.isSocitiesLoading = false;
        }
      });
  }

  navigateToJoin(role: string) {
    this.router.navigate(['/join', role]);
  }

  navigateToAddSociety() {
    this.router.navigate(['society-public', 'add']);
  }

  handleSocietyClick(society: ISociety) {
    this.societyService.handleSocietyClick(society);
  }

  get hasAnyApprovals(): boolean {
    return Object.keys(this.approvals).length > 0;
  }

  handleApprovalClick(type: string, item: any) {
    const societyId = this.getObjectId(item.societyId);
    const flatId = this.getObjectId(item.flatId);
    const profile = this.loginService.getProfileFromStorage();

    if (!profile) return;

    const societyContext = profile.socities.find(s => s.societyId === societyId);
    const roles = societyContext?.societyRoles.map(r => r.name) || [];

    switch (type) {
      case 'gateEntry':
        if (roles.includes('security')) {
          if (item.status === 'approved') {
            this.markGateEntryAsSeen(item._id);
          }
          this.router.navigate(['/gateentry/dashboard', societyId]);
        } else {
          // flat owner / tenant / member
          this.router.navigate(['/visitors', flatId || 'list', 'list']);
        }
        break;
      case 'society':
        this.router.navigate(['/society/pendingApproval/societies']);
        break;
      case 'join':
        const targetTab = item.requestType === 'Security' ? 'security' : 'flats';
        this.router.navigate(['/society/pendingApproval', targetTab]);
        break;
      case 'rent':
        this.router.navigate(['/myflats/rent-list', flatId]);
        break;
      case 'maintenance':
        if (roles.some(r => ['societyadmin', 'manager'].includes(r))) {
          this.router.navigate(['/society', societyId, 'maintenance']);
        } else {
          // For members, usually they see logs in their flat details
          this.router.navigate(['/myflats/list']);
        }
        break;
      case 'document':
        this.router.navigate(['/myflats/tenant-document-manager', flatId], {
          queryParams: {
            flatMemberId: this.getObjectId(item.flatMemberId),
            societyId: this.getObjectId(item.societyId)
          }
        });
        break;
    }
  }

  getObjectId(obj: any): string {
    if (!obj) return '';
    return typeof obj === 'string' ? obj : obj._id;
  }

  getFlatNumber(flat: any): string {
    if (!flat || typeof flat === 'string') return '';
    return flat.flatNumber || '';
  }

  getBuildingNumber(flat: any): string {
    if (!flat || typeof flat === 'string' || !flat.buildingId || typeof flat.buildingId === 'string') return '';
    return flat.buildingId.buildingNumber || '';
  }

  getUserName(user: any): string {
    if (!user || typeof user === 'string') return '';
    return user.name || user.email || '';
  }

  getGateEntryIcon(item: any): string {
    const societyId = this.getObjectId(item.societyId);
    const profile = this.loginService.getProfileFromStorage();
    if (!profile) return 'visitor';

    const societyContext = profile.socities.find(s => s.societyId === societyId);
    const roles = societyContext?.societyRoles.map(r => r.name) || [];

    return roles.includes('security') ? 'security' : 'visitor';
  }

  private getSeenGateEntryIds(): string[] {
    try {
      const today = new Date().toDateString();
      const stored = localStorage.getItem('seen_gate_entries_data');
      if (!stored) return [];

      const data = JSON.parse(stored);
      // If date is different (new day), clear IDs
      if (data.date !== today) {
        localStorage.removeItem('seen_gate_entries_data');
        return [];
      }

      return data.ids || [];
    } catch (e) {
      return [];
    }
  }

  private markGateEntryAsSeen(id: string) {
    const today = new Date().toDateString();
    const seenIds = this.getSeenGateEntryIds();

    if (!seenIds.includes(id)) {
      seenIds.push(id);
      const data = {
        date: today,
        ids: seenIds
      };
      localStorage.setItem('seen_gate_entries_data', JSON.stringify(data));

      // Immediately filter it out from current view
      if (this.approvals.gateEntries) {
        this.approvals.gateEntries = this.approvals.gateEntries.filter(ge => ge._id !== id);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}