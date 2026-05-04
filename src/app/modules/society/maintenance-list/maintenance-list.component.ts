import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Subject, take, takeUntil } from 'rxjs';
import { SocietyService } from '../../../services/society.service';
import { MaintenanceService } from '../../../services/maintenance.service';
import { LoginService } from '../../../services/login.service';
import { WindowService } from '../../../services/window.service';
import { DialogService } from '../../../services/dialog.service';
import {
  IMaintenanceMonthlyReport,
  IMaintenanceReportEntry,
  IMaintenanceYearlyReport,
  IMaintenancePayment,
  IUIControlConfig,
  IUIDropdownOption,
  IConfirmationPopupDataConfig
} from '../../../interfaces';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CountryService } from '../../../services/country.service';
import { CurrencyService } from '../../../services/currency.service';

interface IMaintenanceFilter {
  societyId?: string;
  month?: number;
  year?: number;
  statusFilter?: string;
}

@Component({
  selector: 'app-maintenance-list',
  templateUrl: './maintenance-list.component.html',
  styleUrl: './maintenance-list.component.scss'
})
export class MaintenanceListComponent implements OnInit, OnDestroy {

  isComponentActive = new Subject<void>();

  // Data
  monthlyReport?: IMaintenanceMonthlyReport;
  yearlyReport?: IMaintenanceYearlyReport;
  filteredEntries: IMaintenanceReportEntry[] = [];

  // Loading states
  loadingReport = false;
  approving = false;
  rejecting = false;
  recordingPayment = false;

  // Filters
  selectedFilter: IMaintenanceFilter = {};
  // Selected tab
  selectedTab = 'monthly';

  // Dropdown controls following announcement-list pattern
  monthControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  monthConfig: IUIControlConfig<IUIDropdownOption | undefined | null> = {
    id: 'month',
    label: 'Month',
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
    formControl: this.yearControl,
    dropDownOptions: Array.from({ length: 5 }, (_, i) => {
      const currentYear = new Date().getFullYear();
      return { value: currentYear - i, label: (currentYear - i).toString() };
    })
  };

  statusFilterControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  statusFilterConfig: IUIControlConfig<IUIDropdownOption | undefined | null> = {
    id: 'statusFilter',
    label: 'Status',
    formControl: this.statusFilterControl,
    dropDownOptions: [
      { value: 'all', label: 'All' },
      { value: 'approved', label: 'Paid' },
      { value: 'pending_approval', label: 'Pending' },
      { value: 'not_paid', label: 'Not Paid' },
      { value: 'rejected', label: 'Rejected' }
    ]
  };

  // Payment recording dialog
  @ViewChild('recordPaymentTemplate') recordPaymentTemplate!: TemplateRef<any>;
  currentDialogRef: MatDialogRef<any> | null = null;
  selectedEntry?: IMaintenanceReportEntry;
  paymentAmount = new FormControl<number>(0);
  paymentDate = new FormControl<Date>(new Date());
  paymentMonth = new FormControl<number>(new Date().getMonth() + 1);
  paymentYear = new FormControl<number>(new Date().getFullYear());
  paymentNote = new FormControl<string>('');

  // Configs
  tabsConfig: IUIControlConfig = { id: 'reportTab', label: '' };
  tabsOptions: IUIDropdownOption[] = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  dateConfig: IUIControlConfig = { id: 'paidOn', label: 'Payment Date' };

  get currentMonthLabel(): string {
    return this.monthControl.value?.label ?? this.maintenanceService.getMonthFullName(new Date().getMonth() + 1);
  }

  get paidCount(): number {
    return this.monthlyReport?.summary.paidCount ?? 0;
  }

  get pendingCount(): number {
    return this.monthlyReport?.summary.pendingCount ?? 0;
  }

  get totalFlats(): number {
    return this.monthlyReport?.summary.totalFlats ?? 0;
  }

  get currencySymbol(): string {
    return this.countryService.loggedInUserCountryCurrency?.currencySymbol ?? '₹';
  }

  get notPaidCount(): number {
    return this.totalFlats - this.paidCount - this.pendingCount;
  }

  get totalCollected(): number {
    return this.monthlyReport?.summary.totalCollected ?? 0;
  }

  get monthOptions(): IUIDropdownOption[] {
    return this.monthConfig.dropDownOptions ?? [];
  }

  get yearOptions(): IUIDropdownOption[] {
    return this.yearConfig.dropDownOptions ?? [];
  }

  get statusFilterOptions(): IUIDropdownOption[] {
    return this.statusFilterConfig.dropDownOptions ?? [];
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public societyService: SocietyService,
    public maintenanceService: MaintenanceService,
    private loginService: LoginService,
    public windowService: WindowService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    public countryService: CountryService,
    private currencyService: CurrencyService
  ) { }

  ngOnInit(): void {
    // Set defaults
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const defaultMonth = this.monthOptions.find(o => o.value === currentMonth);
    const defaultYear = this.yearOptions.find(o => o.value === currentYear);
    if (defaultMonth) this.monthControl.setValue(defaultMonth);
    if (defaultYear) this.yearControl.setValue(defaultYear);
  }

  /**
   * Called by app-filter's (filterChanged) event.
   * The filter object contains extracted values from ALL form controls:
   * { societyId: '...', month: 3, year: 2026, statusFilter: 'approved' }
   */
  onFilterChanged(filter: IMaintenanceFilter) {
    this.selectedFilter = filter;
    this.loadReport();
  }

  loadReport() {
    if (!this.selectedFilter.societyId) return;

    if (this.selectedTab === 'monthly') {
      this.loadMonthlyReport();
    } else {
      this.loadYearlyReport();
    }
  }

  loadMonthlyReport() {
    if (!this.selectedFilter.societyId) return;

    // Values come from selectedFilter (extracted by app-filter) or fall back to defaults
    const month = this.selectedFilter.month || this.monthControl.value?.value || (new Date().getMonth() + 1);
    const year = this.selectedFilter.year || this.yearControl.value?.value || new Date().getFullYear();

    this.loadingReport = true;
    this.maintenanceService.getMonthlyReport(this.selectedFilter.societyId, month, year)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;
          this.monthlyReport = response.data;
          this.applyFilters();
          this.loadingReport = false;
        },
        error: () => {
          this.loadingReport = false;
        }
      });
  }

  loadYearlyReport() {
    if (!this.selectedFilter.societyId) return;

    const year = this.selectedFilter.year || this.yearControl.value?.value || new Date().getFullYear();

    this.loadingReport = true;
    this.maintenanceService.getYearlyReport(this.selectedFilter.societyId, year)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;
          this.yearlyReport = response.data;
          this.loadingReport = false;
        },
        error: () => {
          this.loadingReport = false;
        }
      });
  }

  applyFilters() {
    if (!this.monthlyReport) return;

    let entries = this.monthlyReport.entries;

    // Apply Status Filter — value comes from selectedFilter (already extracted by app-filter)
    const status = this.selectedFilter.statusFilter;
    if (status && status !== 'all') {
      entries = entries.filter(e => e.status === status);
    }

    this.filteredEntries = entries;
  }

  handleTabChange(tab: string) {
    this.selectedTab = tab;
    this.loadReport();
  }

  getStatusClass(status: string): string {
    return this.maintenanceService.getStatusColorName(status);
  }

  getStatusText(status: string): string {
    return this.maintenanceService.getStatusDisplayText(status);
  }

  // Admin: Record payment for a flat
  openRecordPaymentDialog(entry: IMaintenanceReportEntry) {
    this.selectedEntry = entry;
    const amountInINR = entry.payment?.amount ?? 0;
    this.paymentAmount.setValue(this.currencyService.convertFromINR(amountInINR));
    this.paymentMonth.setValue(this.selectedFilter.month || (new Date().getMonth() + 1));
    this.paymentYear.setValue(this.selectedFilter.year || new Date().getFullYear());
    this.paymentDate.setValue(new Date());
    this.paymentNote.setValue('');

    const width = this.windowService.mode.value === 'mobile' ? '90%' :
      this.windowService.mode.value === 'tablet' ? '70%' : '50%';

    this.currentDialogRef = this.dialog.open(this.recordPaymentTemplate, {
      width,
      panelClass: 'maintenance-dialog'
    });
  }

  closeDialog() {
    this.currentDialogRef?.close();
    this.currentDialogRef = null;
  }

  recordPayment() {
    if (!this.selectedEntry || !this.selectedFilter.societyId) return;

    this.recordingPayment = true;
    const payload = {
      societyId: this.selectedFilter.societyId,
      flatId: this.selectedEntry.flatId,
      flatMemberId: this.selectedEntry.flatMemberId,
      amount: this.currencyService.convertToINR(this.paymentAmount.value ?? 0),
      month: this.paymentMonth.value,
      year: this.paymentYear.value,
      paidOn: this.paymentDate.value || new Date(),
      note: this.paymentNote.value
    };

    this.maintenanceService.recordPayment(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;
          this.recordingPayment = false;
          this.closeDialog();
          this.loadMonthlyReport();
        },
        error: () => {
          this.recordingPayment = false;
        }
      });
  }

  viewLogs(entry: IMaintenanceReportEntry) {
    this.router.navigate(['/myflats/logs', entry.flatId], {
      queryParams: { societyId: this.selectedFilter.societyId }
    });
  }

  // Admin: Approve a payment
  onApprove(entry: IMaintenanceReportEntry) {
    if (!entry.payment) return;

    this.approving = true;
    this.maintenanceService.approvePayment(entry.payment._id)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;
          this.approving = false;
          this.loadMonthlyReport();
        },
        error: () => {
          this.approving = false;
        }
      });
  }

  // Admin: Reject a payment
  async onReject(entry: IMaintenanceReportEntry) {
    if (!entry.payment) return;

    this.dialogService.showConfirmation({
      message: 'Are you sure you want to reject this payment?',
      showInput: true,
      inputPlaceholder: 'Reason for rejection (e.g. Invalid screenshot, amount mismatch)',
      actionButtons: [
        { label: 'Cancel', result: false, class: 'cancel', onClick: () => { } },
        { label: 'Reject', result: true, class: 'error', onClick: () => { } }
      ]
    }, 30000).subscribe(result => {
      if (result && (typeof result === 'object' ? result.result : result)) {
        const reason = typeof result === 'object' ? result.inputValue : '';
        this.rejecting = true;
        this.maintenanceService.rejectPayment(entry.payment!._id, reason)
          .pipe(take(1))
          .subscribe({
            next: response => {
              if (!response.success) return;
              this.rejecting = false;
              this.loadMonthlyReport();
            },
            error: () => {
              this.rejecting = false;
            }
          });
      }
    });
  }

  onRemind(entry: IMaintenanceReportEntry) {
    if (!this.selectedFilter.societyId) return;

    const month = this.selectedFilter.month || (new Date().getMonth() + 1);
    const year = this.selectedFilter.year || new Date().getFullYear();

    this.maintenanceService.sendReminder(
      this.selectedFilter.societyId,
      entry.flatId,
      month,
      year
    ).pipe(take(1)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dialogService.showConfirmation({
            message: 'Reminder sent successfully',
            icon: 'valid',
            actionButtons: []
          }, 1500);
        }
      }
    });
  }

  onRemindAll() {
    if (!this.selectedFilter.societyId) return;

    const month = this.selectedFilter.month || (new Date().getMonth() + 1);
    const year = this.selectedFilter.year || new Date().getFullYear();

    this.dialogService.showConfirmation({
      message: `Send maintenance reminders to all pending flats for ${this.maintenanceService.getMonthFullName(month)} ${year}?`,
      icon: 'notifications',
      actionButtons: [
        { label: 'Cancel', result: false, class: 'cancel', onClick: () => { } },
        { label: 'Send All', result: true, class: 'primary', onClick: () => { } }
      ]
    }, 10000).subscribe(confirm => {
      if (confirm) {
        this.maintenanceService.sendReminderAll(this.selectedFilter.societyId!, month, year)
          .pipe(take(1))
          .subscribe(res => {
            if (res.success) {
              this.dialogService.showConfirmation({
                message: 'All reminders sent successfully',
                icon: 'valid',
                actionButtons: []
              }, 2000);
            }
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
    this.currentDialogRef?.close();
  }
}
