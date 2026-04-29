import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Location } from '@angular/common';
import { MaintenanceService } from '../../../services/maintenance.service';
import { CountryService } from '../../../services/country.service';
import { IMaintenanceLog } from '../../../interfaces';
import { FormControl } from '@angular/forms';

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
  loading = false;
  
  // Filters
  monthControl = new FormControl<number | null>(null);
  yearControl = new FormControl<number | null>(null);
  statusControl = new FormControl<string>('all');
  typeControl = new FormControl<string>('all');

  constructor(
    private route: ActivatedRoute,
    public maintenanceService: MaintenanceService,
    private countryService: CountryService,
    private location: Location
  ) {}

  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.flatId = params['id'];
      this.societyId = this.route.snapshot.queryParams['societyId'] || '';
      this.loadLogs();
    });

    // Handle filter changes
    this.monthControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.applyFilters());
    this.yearControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.applyFilters());
    this.statusControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.applyFilters());
    this.typeControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.applyFilters());
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
            this.logs = res.data;
            this.applyFilters();
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    const month = this.monthControl.value;
    const year = this.yearControl.value;
    const status = this.statusControl.value;
    const type = this.typeControl.value;

    this.filteredLogs = this.logs.filter(log => {
      if (month && log.month !== month) return false;
      if (year && log.year !== year) return false;
      if (type !== 'all' && log.logType !== type) return false;
      if (status !== 'all' && log.logType === 'payment' && log.status !== status) return false;
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
  
  get yearOptions(): number[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }

  get monthOptions() {
    return Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: this.maintenanceService.getMonthFullName(i + 1) }));
  }
}
