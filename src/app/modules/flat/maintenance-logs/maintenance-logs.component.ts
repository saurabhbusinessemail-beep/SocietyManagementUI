import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { MaintenanceService } from '../../../services/maintenance.service';
import { CountryService } from '../../../services/country.service';
import { IMaintenanceLog, IMaintenanceLogsResponse, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { FormControl } from '@angular/forms';
import { WindowService } from '../../../services/window.service';

@Component({
  selector: 'app-maintenance-logs',
  templateUrl: './maintenance-logs.component.html',
  styleUrls: ['./maintenance-logs.component.scss']
})
export class MaintenanceLogsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  flatId: string = '';
  societyId: string = '';
  logs: IMaintenanceLog[] = [];
  filteredLogs: IMaintenanceLog[] = [];
  flat?: IMaintenanceLogsResponse['flat'];
  loading = false;

  // Filters — following announcement-list pattern exactly
  monthControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  monthConfig: IUIControlConfig<IUIDropdownOption | undefined | null> = {
    id: 'month',
    label: 'Month',
    placeholder: 'All Months',
    formControl: this.monthControl,
    dropDownOptions: Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: this.maintenanceService.getMonthFullName(i + 1)
    }))
  };

  yearControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  yearConfig: IUIControlConfig<IUIDropdownOption | undefined | null> = {
    id: 'year',
    label: 'Year',
    placeholder: 'All Years',
    formControl: this.yearControl,
    dropDownOptions: Array.from({ length: 5 }, (_, i) => {
      const currentYear = new Date().getFullYear();
      return { value: currentYear - i, label: (currentYear - i).toString() };
    })
  };

  typeControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  typeConfig: IUIControlConfig<IUIDropdownOption | undefined | null> = {
    id: 'type',
    label: 'Log Type',
    placeholder: 'All Logs',
    formControl: this.typeControl,
    dropDownOptions: [
      { value: 'all', label: 'All Logs' },
      { value: 'payment', label: 'Payments Only' },
      { value: 'reminder', label: 'Reminders Only' }
    ]
  };

  statusControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  statusConfig: IUIControlConfig<IUIDropdownOption | undefined | null> = {
    id: 'status',
    label: 'Status',
    placeholder: 'All Status',
    formControl: this.statusControl,
    dropDownOptions: [
      { value: 'all', label: 'All Status' },
      { value: 'approved', label: 'Paid' },
      { value: 'pending_approval', label: 'Pending' },
      { value: 'rejected', label: 'Rejected' }
    ]
  };

  // Store last filter values from app-filter
  private currentFilter: any = {};

  constructor(
    private route: ActivatedRoute,
    public maintenanceService: MaintenanceService,
    private countryService: CountryService,
    private location: Location,
    public windowService: WindowService
  ) { }

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.flatId = params['id'];
      this.societyId = this.route.snapshot.queryParams['societyId'] || '';
      if (this.societyId === '[object Object]') {
        this.societyId = '';
      }
      this.loadLogs();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLogs(): void {
    this.loading = true;
    this.maintenanceService.getLogs(this.flatId, this.societyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.logs = res.data.logs;
            this.flat = res.data.flat;
            this.applyFilters();
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  /**
   * Called by app-filter's (filterChanged) event.
   * The filter object contains extracted values: { month: 3, year: 2026, type: 'payment', status: 'approved' }
   */
  handleFilterChanged(filter: any) {
    this.currentFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    const month = this.currentFilter.month;
    const year = this.currentFilter.year;
    const status = this.currentFilter.status;
    const type = this.currentFilter.type || 'all';

    this.filteredLogs = this.logs.filter(log => {
      if (month && log.month !== month) return false;
      if (year && log.year !== year) return false;
      if (type !== 'all' && log.logType !== type) return false;
      if (status && status !== 'all' && log.logType === 'payment' && log.status !== status) return false;
      return true;
    });
  }

  get currencySymbol(): string {
    return this.countryService.loggedInUserCountryCurrency?.currencySymbol ?? '₹';
  }

  getMonthName(month: number): string {
    return this.maintenanceService.getMonthName(month);
  }

  getStatusColor(status: string): string {
    return this.maintenanceService.getStatusColorName(status);
  }

  getStatusText(status: string): string {
    return this.maintenanceService.getStatusDisplayText(status);
  }
}
