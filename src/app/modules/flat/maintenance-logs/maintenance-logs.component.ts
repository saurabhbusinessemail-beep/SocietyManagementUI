import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { MaintenanceService } from '../../../services/maintenance.service';
import { CountryService } from '../../../services/country.service';
import { IMaintenanceLog, IMaintenanceLogsResponse, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { FormControl } from '@angular/forms';
import { WindowService } from '../../../services/window.service';
import { LangChangeEvent, TranslateService, TranslationChangeEvent } from '@ngx-translate/core';

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
  monthConfig!: IUIControlConfig<IUIDropdownOption | undefined | null>;

  yearControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  yearConfig!: IUIControlConfig<IUIDropdownOption | undefined | null>;

  typeControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  typeConfig!: IUIControlConfig<IUIDropdownOption | undefined | null>;

  statusControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  statusConfig!: IUIControlConfig<IUIDropdownOption | undefined | null>;

  // Store last filter values from app-filter
  private currentFilter: any = {};

  constructor(
    private route: ActivatedRoute,
    public maintenanceService: MaintenanceService,
    private countryService: CountryService,
    private location: Location,
    public windowService: WindowService,
    private translate: TranslateService
  ) { }

  goBack(): void {
    this.location.back();
  }

  initFilterConfigs() {
    this.monthConfig = {
      id: 'month',
      label: this.translate.instant('MAINTENANCE.MONTH') || 'Month',
      placeholder: this.translate.instant('MAINTENANCE.ALL_MONTHS') || 'All Months',
      formControl: this.monthControl,
      dropDownOptions: Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: this.translate.instant('MONTHS.' + (i + 1)) || this.maintenanceService.getMonthFullName(i + 1)
      }))
    };

    this.yearConfig = {
      id: 'year',
      label: this.translate.instant('MAINTENANCE.YEAR') || 'Year',
      placeholder: this.translate.instant('MAINTENANCE.ALL_YEARS') || 'All Years',
      formControl: this.yearControl,
      dropDownOptions: Array.from({ length: 5 }, (_, i) => {
        const currentYear = new Date().getFullYear();
        return { value: currentYear - i, label: (currentYear - i).toString() };
      })
    };

    this.typeConfig = {
      id: 'type',
      label: this.translate.instant('MAINTENANCE.LOG_TYPE') || 'Log Type',
      placeholder: this.translate.instant('MAINTENANCE.LOG_TYPE_ALL') || 'All Logs',
      formControl: this.typeControl,
      dropDownOptions: [
        { value: 'all', label: this.translate.instant('MAINTENANCE.LOG_TYPE_ALL') || 'All Logs' },
        { value: 'payment', label: this.translate.instant('MAINTENANCE.LOG_TYPE_PAYMENTS') || 'Payments Only' },
        { value: 'reminder', label: this.translate.instant('MAINTENANCE.LOG_TYPE_REMINDERS') || 'Reminders Only' }
      ]
    };

    this.statusConfig = {
      id: 'status',
      label: this.translate.instant('MAINTENANCE.STATUS') || 'Status',
      placeholder: this.translate.instant('MAINTENANCE.ALL_STATUS') || 'All Status',
      formControl: this.statusControl,
      dropDownOptions: [
        { value: 'all', label: this.translate.instant('MAINTENANCE.ALL_STATUS') || 'All Status' },
        { value: 'approved', label: this.translate.instant('MAINTENANCE.PAID') || 'Paid' },
        { value: 'pending_approval', label: this.translate.instant('MAINTENANCE.PENDING') || 'Pending' },
        { value: 'rejected', label: this.translate.instant('MAINTENANCE.STATUS_REJECTED') || 'Rejected' }
      ]
    };
  }

  ngOnInit(): void {
    this.initFilterConfigs();
    // Re-init when language changes (user switches language)
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((_: LangChangeEvent) => {
      this.initFilterConfigs();
    });
    // Re-init when translations first load (fixes key-only labels on initial page visit)
    this.translate.onTranslationChange.pipe(takeUntil(this.destroy$)).subscribe((_: TranslationChangeEvent) => {
      this.initFilterConfigs();
    });

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.flatId = params['id'];
      this.societyId = this.route.snapshot.queryParams['societyId'] || '';
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
