import { Component, OnInit } from '@angular/core';
import { IGateEntry, IMyProfile, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { GateEntryService } from '../../../services/gate-entry.service';
import { Subject, take, takeUntil } from 'rxjs';
import { GateEntryStatus, UILabelValueType } from '../../../types';
import { FormControl } from '@angular/forms';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';

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
  isComponentActive = new Subject<void>();

  selectedFIlter: IVisitorFilter = {};
  selectedDateControl = new FormControl<Date | string>(new Date());

  selectedDateControlConfig: IUIControlConfig<Date | undefined | null | string> = {
    id: 'createdOn',
    label: 'Created On',
    formControl: this.selectedDateControl
  };

  constructor(
    private gateEntryService: GateEntryService,
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();
    if (!this.myProfile) {
      this.router.navigateByUrl('/');
      return;
    }
  }

  getGateEntryStatusColorName(gateEntry: IGateEntry): string {
    return this.gateEntryService.getGateEntryStatusColorName(gateEntry);
  }

  getGateEntryLabelType(gateEntry: IGateEntry): UILabelValueType {
    switch (gateEntry.status) {
      case 'approved': return 'active';
      case 'cancelled': return 'rejected';
      case 'completed': return 'active';
      case 'expired': return 'inactive';
      case 'rejected': return 'rejected';
      case 'requested': return 'pending';
    }
  }

  loadGateEntries(selectedFilter: IVisitorFilter) {
    this.selectedFIlter = selectedFilter;

    const date = this.selectedDateControl.value ? new Date(this.selectedDateControl.value) : undefined;
    this.gateEntryService.getAllMyGateEntries(selectedFilter.societyId, selectedFilter.flatId, undefined, date)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.gateEntries = response.data;
          // this.filterEntriesByDate();
        }
      });
  }

  formatTime(date: Date): string {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  onApprove(gateEntry: IGateEntry): void {
    this.gateEntryService.changeStatus(gateEntry._id, 'approved')
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.loadGateEntries(this.selectedFIlter);
        }
      });
  }

  onReject(gateEntry: IGateEntry): void {
    this.gateEntryService.changeStatus(gateEntry._id, 'rejected')
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.loadGateEntries(this.selectedFIlter);
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
