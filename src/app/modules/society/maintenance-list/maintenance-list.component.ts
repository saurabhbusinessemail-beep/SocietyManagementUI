import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
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

interface IMaintenanceFilter {
  societyId?: string;
  flatId?: string;
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
  selectedTab = 'monthly';

  // Month/Year controls
  monthControl = new FormControl<number>(new Date().getMonth() + 1);
  yearControl = new FormControl<number>(new Date().getFullYear());

  // Status filter
  statusFilterControl = new FormControl<string>('all');
  searchControl = new FormControl<string>('');
  mobileFilterControl = new FormControl<string>('');

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

  monthConfig: IUIControlConfig = { id: 'month', label: 'Month' };
  yearConfig: IUIControlConfig = { id: 'year', label: 'Year' };
  statusFilterConfig: IUIControlConfig = { id: 'statusFilter', label: 'Status' };
  searchConfig: IUIControlConfig = { id: 'search', label: 'Search', placeholder: 'Flat # or Name' };
  dateConfig: IUIControlConfig = { id: 'paidOn', label: 'Payment Date' };

  statusFilterOptions: IUIDropdownOption[] = [
    { value: 'all', label: 'All' },
    { value: 'approved', label: 'Paid' },
    { value: 'pending_approval', label: 'Pending' },
    { value: 'not_paid', label: 'Not Paid' },
    { value: 'rejected', label: 'Rejected' }
  ];

  get monthOptions(): IUIDropdownOption[] {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: this.maintenanceService.getMonthFullName(i + 1)
    }));
  }

  get yearOptions(): IUIDropdownOption[] {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => ({
      value: currentYear - i,
      label: (currentYear - i).toString()
    }));
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public societyService: SocietyService,
    public maintenanceService: MaintenanceService,
    private loginService: LoginService,
    private windowService: WindowService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    public countryService: CountryService
  ) { }

  ngOnInit(): void {
    this.subscribeToChanges();

    // Fix refresh issue: load if society already selected
    const selectedSociety = this.societyService.selectedSocietyFilterValue;
    if (selectedSociety) {
      this.selectedFilter = { societyId: selectedSociety.value };
      this.loadReport();
    }
  }

  subscribeToChanges() {
    this.monthControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(() => this.loadReport());

    this.yearControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(() => this.loadReport());

    this.statusFilterControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(() => this.applyFilters());

    this.searchControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(() => this.applyFilters());

    this.mobileFilterControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(() => this.applyFilters());
  }

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

    const month = this.monthControl.value || (new Date().getMonth() + 1);
    const year = this.yearControl.value || new Date().getFullYear();

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

    const year = this.yearControl.value || new Date().getFullYear();

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

    // Apply Status Filter
    const status = this.statusFilterControl.value;
    if (status && status !== 'all') {
      entries = entries.filter(e => e.status === status);
    }

    // Apply Search Filter
    const search = this.searchControl.value?.toLowerCase();
    if (search) {
      entries = entries.filter(e =>
        (e.flatNumber && e.flatNumber.toLowerCase().includes(search)) ||
        (e.memberName && e.memberName.toLowerCase().includes(search))
      );
    }

    // Apply Mobile Filter
    const mobileSearch = this.mobileFilterControl.value;
    if (mobileSearch) {
      entries = entries.filter(e =>
        e.memberContact && e.memberContact.includes(mobileSearch)
      );
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
    this.paymentAmount.setValue(entry.payment?.amount ?? 0);
    this.paymentMonth.setValue(this.monthControl.value || (new Date().getMonth() + 1));
    this.paymentYear.setValue(this.yearControl.value || new Date().getFullYear());
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
      amount: this.paymentAmount.value,
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

    this.maintenanceService.sendReminder(
      this.selectedFilter.societyId,
      entry.flatId,
      this.monthControl.value!,
      this.yearControl.value!
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

    const month = this.monthControl.value!;
    const year = this.yearControl.value!;

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
