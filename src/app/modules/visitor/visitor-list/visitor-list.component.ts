import { Component, OnInit } from '@angular/core';
import { IGateEntry, IMyProfile, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { GateEntryService } from '../../../services/gate-entry.service';
import { Subject, take, takeUntil } from 'rxjs';
import { GateEntryStatus, UILabelValueType } from '../../../types';
import { FormControl } from '@angular/forms';
import { LoginService } from '../../../services/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';

interface IVisitorFilter {
  societyId?: string, flatId?: string, createdOn?: Date
}

@Component({
  selector: 'app-visitor-list',
  templateUrl: './visitor-list.component.html',
  styleUrl: './visitor-list.component.scss'
})
export class VisitorListComponent implements OnInit {

  gateEntries: IGateEntry[] = [];
  societyOptions: IUIDropdownOption[] = [];
  flatOptions: IUIDropdownOption[] = [];

  myProfile?: IMyProfile;
  routeFlatId?: string;
  isComponentActive = new Subject<void>();

  selectedFIlter: IVisitorFilter = {};
  selectedDateControl = new FormControl<Date | string>(new Date());

  loadingGateEntries = false;
  approving = false;
  rejecting = false;

  selectedDateControlConfig: IUIControlConfig<Date | undefined | null | string> = {
    id: 'createdOn',
    label: 'Created On',
    formControl: this.selectedDateControl
  };

  constructor(
    private gateEntryService: GateEntryService,
    private loginService: LoginService,
    private router: Router,
    public societyService: SocietyService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();
    if (!this.myProfile) {
      this.router.navigateByUrl('/');
      return;
    }
    this.routeFlatId = this.route.snapshot.paramMap.get('flatId') ?? '';
  }

  getGateEntryStatusColorName(gateEntry: IGateEntry): string {
    return this.gateEntryService.getGateEntryStatusColorName(gateEntry);
  }

  getGateEntryLabelType(gateEntry: IGateEntry): UILabelValueType {
    return this.gateEntryService.getGateEntryLabelType(gateEntry);
  }

  loadGateEntries(selectedFilter: IVisitorFilter) {
    this.selectedFIlter = selectedFilter;
    this.gateEntries = [];
    this.loadingGateEntries = true;

    const date = this.selectedDateControl.value ? new Date(this.selectedDateControl.value) : undefined;
    this.gateEntryService.getAllMyGateEntries(selectedFilter.societyId, selectedFilter.flatId, undefined, date)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.gateEntries = response.data;
          this.loadingGateEntries = false;
          // this.filterEntriesByDate();
        },
        error: err => {
          this.loadingGateEntries = false;
        }
      });
  }

  formatTime(date: Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  onApprove(gateEntry: IGateEntry): void {
    this.approving = true;
    this.gateEntryService.changeStatus(gateEntry._id, 'approved')
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.loadGateEntries(this.selectedFIlter);
          this.approving = false;
        },
        error: err => {
          this.approving = false;
        }
      });
  }

  onReject(gateEntry: IGateEntry): void {
    this.rejecting = true;
    this.gateEntryService.changeStatus(gateEntry._id, 'rejected')
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.loadGateEntries(this.selectedFIlter);
          this.rejecting = false;
        },
        error: err => {
          this.rejecting = false;
        }
      });
  }

  getStatusClass(status: GateEntryStatus): string {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'requested': return 'status-requested';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  }

}
