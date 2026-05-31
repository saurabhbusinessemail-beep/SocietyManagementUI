// user.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISociety } from '../../../interfaces';
import { Subject, take, combineLatest, Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { SocietyService } from '../../../services/society.service';
import { DashboardService } from '../../../services/dashboard.service';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';
import { IDashboardApprovals } from '../../../interfaces';
import { SocietyRoles } from '../../../types';
import { USER_DASHBOARD_TOUR } from './user-dashboard.tour';
import { TourConfig } from '../../../interfaces/tour.model';
import { WindowService } from '../../../services/window.service';

/**
 * All conditional step IDs – steps that depend on runtime data.
 * Initially ALL are excluded; each is removed once its data confirms presence.
 */
const CONDITIONAL_STEP_IDS = ['approvals-section', 'approval-card'];

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit, OnDestroy {

  /** Base tour configuration. */
  readonly tourConfig: TourConfig = USER_DASHBOARD_TOUR;

  /**
   * Starts with all conditional steps excluded.
   * Shrinks reactively as each API call completes and reveals data.
   * The overlay watches ngOnChanges for this and triggers mini-tours
   * for steps that become available after the initial tour.
   */
  tourExcludeStepIds: string[] = [...CONDITIONAL_STEP_IDS];

  /**
   * Fires once when BOTH API calls complete (with or without data).
   * Signals the overlay that it's safe to run the initial tour start flow.
   */
  tourReady$!: Observable<void>;

  // Track when each load finishes
  private _societiesLoaded$ = new BehaviorSubject<boolean>(false);
  private _approvalsLoaded$ = new BehaviorSubject<boolean>(false);

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
    // {
    //   role: SocietyRoles.security,
    //   label: 'Security',
    //   icon: 'security'
    // }
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
    private router: Router,
    private windowService: WindowService
  ) { }

  ngOnInit(): void {
    // tourReady$ fires once after BOTH loads complete (success or error).
    // At that moment tourExcludeStepIds is already updated by each load handler.
    this.tourReady$ = combineLatest([this._societiesLoaded$, this._approvalsLoaded$]).pipe(
      filter(([s, a]) => s && a),
      take(1),
      map(() => void 0),
      shareReplay(1)
    );

    this.loadSocieties();
    this.loadApprovals();

    if (this.windowService.mode.value === 'mobile') {
      this.tourExcludeStepIds.push(
        'user-menu-info',
        'user-menu-logout',
        'menu-register-society',
        'menu-request-demo',
        'menu-profile-help',
        'menu-themes'
      );
    }
  }

  loadApprovals() {
    this.isApprovalsLoading = true;
    this.dashboardService.getPendingApprovals()
      .pipe(take(1))
      .subscribe({
        next: response => {
          const data = response.data ?? {};
          if (data.gateEntries) {
            const seenIds = this.getSeenGateEntryIds();
            data.gateEntries = data.gateEntries.filter((ge: any) => !seenIds.includes(ge._id));
          }
          this.approvals = data;
          this.isApprovalsLoading = false;
          // Unlock approval steps if data is present
          if (this.hasAnyApprovals) {
            this.tourExcludeStepIds = this.tourExcludeStepIds
              .filter(id => !['approvals-section', 'approval-card'].includes(id));
          }
          this._approvalsLoaded$.next(true);
        },
        error: () => {
          this.isApprovalsLoading = false;
          this._approvalsLoaded$.next(true);
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
          this._societiesLoaded$.next(true);
        },
        error: () => {
          this.isSocitiesLoading = false;
          // Mark done even on error so the tour isn't blocked forever
          this._societiesLoaded$.next(true);
        }
      });
  }

  navigateToJoin(role: string) { this.router.navigate(['/join', role]); }
  navigateToAddSociety() { this.router.navigate(['society-public', 'add']); }
  handleSocietyClick(society: ISociety) { this.societyService.handleSocietyClick(society); }

  get expectNamePopup(): boolean {
    const user = this.loginService.getProfileFromStorage()?.user;
    return !!(user && !user.name);
  }

  get hasAnyApprovals(): boolean {
    return Object.keys(this.approvals).some(
      key => Array.isArray((this.approvals as any)[key]) && (this.approvals as any)[key].length > 0
    );
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
          if (item.status === 'approved') this.markGateEntryAsSeen(item._id);
          this.router.navigate(['/gateentry/dashboard', societyId]);
        } else {
          this.router.navigate(['/visitors', flatId || 'list', 'list']);
        }
        break;
      case 'society':
        this.router.navigate(['/society/pendingApproval/societies']); break;
      case 'join':
        const targetTab = item.requestType === 'Security' ? 'security' : 'flats';
        this.router.navigate(['/society/pendingApproval', targetTab]); break;
      case 'rent':
        this.router.navigate(['/myflats/rent-list', flatId]); break;
      case 'maintenance':
        if (roles.some(r => ['societyadmin', 'manager'].includes(r))) {
          this.router.navigate(['/society', societyId, 'maintenance']);
        } else {
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
      if (data.date !== today) { localStorage.removeItem('seen_gate_entries_data'); return []; }
      return data.ids || [];
    } catch (e) { return []; }
  }

  private markGateEntryAsSeen(id: string) {
    const today = new Date().toDateString();
    const seenIds = this.getSeenGateEntryIds();
    if (!seenIds.includes(id)) {
      seenIds.push(id);
      localStorage.setItem('seen_gate_entries_data', JSON.stringify({ date: today, ids: seenIds }));
      if (this.approvals.gateEntries) {
        this.approvals.gateEntries = this.approvals.gateEntries.filter(ge => ge._id !== id);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this._societiesLoaded$.complete();
    this._approvalsLoaded$.complete();
  }
}