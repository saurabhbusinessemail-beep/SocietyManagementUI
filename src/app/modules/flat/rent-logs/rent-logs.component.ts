import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { RentService } from '../../../services/rent.service';
import { CountryService } from '../../../services/country.service';
import { IRentLog, IRentLogsResponse, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { FormControl } from '@angular/forms';
import { WindowService } from '../../../services/window.service';
import { TranslateService, LangChangeEvent, TranslationChangeEvent } from '@ngx-translate/core';

@Component({
  selector: 'app-rent-logs',
  templateUrl: './rent-logs.component.html',
  styleUrls: ['./rent-logs.component.scss']
})
export class RentLogsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  flatId: string = '';
  societyId: string = '';
  logs: IRentLog[] = [];
  filteredLogs: IRentLog[] = [];
  flat?: IRentLogsResponse['flat'];
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
    public rentService: RentService,
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
      label: this.translate.instant('RENT_LOGS.MONTH') || 'Month',
      placeholder: this.translate.instant('RENT_LOGS.ALL_MONTHS') || 'All Months',
      formControl: this.monthControl,
      dropDownOptions: Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: this.translate.instant('MONTHS.' + (i + 1)) || this.rentService.getMonthFullName(i + 1)
      }))
    };
    this.updateControlValue(this.monthControl, this.monthConfig.dropDownOptions || []);

    this.yearConfig = {
      id: 'year',
      label: this.translate.instant('RENT_LOGS.YEAR') || 'Year',
      placeholder: this.translate.instant('RENT_LOGS.ALL_YEARS') || 'All Years',
      formControl: this.yearControl,
      dropDownOptions: Array.from({ length: 5 }, (_, i) => {
        const currentYear = new Date().getFullYear();
        return { value: currentYear - i, label: (currentYear - i).toString() };
      })
    };
    this.updateControlValue(this.yearControl, this.yearConfig.dropDownOptions || []);

    this.typeConfig = {
      id: 'type',
      label: this.translate.instant('RENT_LOGS.LOG_TYPE') || 'Log Type',
      placeholder: this.translate.instant('RENT_LOGS.ALL_LOGS') || 'All Logs',
      formControl: this.typeControl,
      dropDownOptions: [
        { value: 'all', label: this.translate.instant('RENT_LOGS.ALL_LOGS') || 'All Logs' },
        { value: 'payment', label: this.translate.instant('RENT_LOGS.PAYMENTS_ONLY') || 'Payments Only' },
        { value: 'reminder', label: this.translate.instant('RENT_LOGS.REMINDERS_ONLY') || 'Reminders Only' }
      ]
    };
    this.updateControlValue(this.typeControl, this.typeConfig.dropDownOptions || []);

    this.statusConfig = {
      id: 'status',
      label: this.translate.instant('RENT_LOGS.STATUS') || 'Status',
      placeholder: this.translate.instant('RENT_LOGS.ALL_STATUS') || 'All Status',
      formControl: this.statusControl,
      dropDownOptions: [
        { value: 'all', label: this.translate.instant('RENT_LOGS.ALL_STATUS') || 'All Status' },
        { value: 'approved', label: this.translate.instant('RENT_LOGS.PAID') || 'Paid' },
        { value: 'pending_approval', label: this.translate.instant('RENT_LOGS.PENDING') || 'Pending' },
        { value: 'rejected', label: this.translate.instant('RENT_LOGS.REJECTED') || 'Rejected' }
      ]
    };
    this.updateControlValue(this.statusControl, this.statusConfig.dropDownOptions || []);
  }

  updateControlValue(control: FormControl, options: IUIDropdownOption[]) {
    const val = control.value;
    if (val) {
      const actualVal = (typeof val === 'object' && val !== null && 'value' in val) ? val.value : val;
      const matched = options.find(o => o.value === actualVal);
      if (matched) {
        control.setValue(matched, { emitEvent: false });
      }
    }
  }

  ngOnInit(): void {
    this.initFilterConfigs();
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((_: LangChangeEvent) => {
      this.initFilterConfigs();
    });
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
    this.rentService.getLogs(this.flatId, this.societyId)
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
    return this.rentService.getMonthName(month);
  }

  getStatusColor(status: string): string {
    return this.rentService.getStatusColorName(status);
  }

  getStatusText(status: string): string {
    return this.rentService.getStatusDisplayText(status);
  }
}
