import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Subject, take, takeUntil } from 'rxjs';
import { RentService } from '../../../services/rent.service';
import { LoginService } from '../../../services/login.service';
import { WindowService } from '../../../services/window.service';
import { DialogService } from '../../../services/dialog.service';
import {
  IRentMonthlyReport,
  IRentReportEntry,
  IRentPayment,
  IUIControlConfig,
  IUIDropdownOption,
  IConfirmationPopupDataConfig
} from '../../../interfaces';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CountryService } from '../../../services/country.service';

interface IRentFilter {
  month?: number;
  year?: number;
  statusFilter?: string;
}

@Component({
  selector: 'app-rent-list',
  templateUrl: './rent-list.component.html',
  styleUrl: './rent-list.component.scss'
})
export class RentListComponent implements OnInit, OnDestroy {

  isComponentActive = new Subject<void>();

  // Data
  monthlyReport?: IRentMonthlyReport;
  filteredEntries: IRentReportEntry[] = [];
  flatId: string = '';
  societyId: string = '';

  // Loading states
  loadingReport = false;
  approving = false;
  rejecting = false;
  recordingPayment = false;

  // Filters
  selectedFilter: IRentFilter = {};

  // Dropdown controls following announcement-list pattern
  monthControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  monthConfig: IUIControlConfig<IUIDropdownOption | undefined | null> = {
    id: 'month',
    label: 'Month',
    formControl: this.monthControl,
    dropDownOptions: Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: this.rentService.getMonthFullName(i + 1)
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
  selectedEntry?: IRentReportEntry;
  paymentAmount = new FormControl<number>(0);
  paymentDate = new FormControl<Date>(new Date());
  paymentMonth = new FormControl<number>(new Date().getMonth() + 1);
  paymentYear = new FormControl<number>(new Date().getFullYear());
  paymentNote = new FormControl<string>('');

  dateConfig: IUIControlConfig = { id: 'paidOn', label: 'Payment Date' };

  get currentMonthLabel(): string {
    return this.monthControl.value?.label ?? this.rentService.getMonthFullName(new Date().getMonth() + 1);
  }

  get paidCount(): number {
    return this.monthlyReport?.summary.paidCount ?? 0;
  }

  get pendingCount(): number {
    return this.monthlyReport?.summary.pendingCount ?? 0;
  }

  get totalTenants(): number {
    return this.monthlyReport?.summary.totalTenants ?? 0;
  }

  get currencySymbol(): string {
    return this.countryService.loggedInUserCountryCurrency?.currencySymbol ?? '₹';
  }

  get notPaidCount(): number {
    return this.totalTenants - this.paidCount - this.pendingCount;
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
    public rentService: RentService,
    private loginService: LoginService,
    public windowService: WindowService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    public countryService: CountryService
  ) { }

  ngOnInit(): void {
    // Set defaults
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const defaultMonth = this.monthOptions.find(o => o.value === currentMonth);
    const defaultYear = this.yearOptions.find(o => o.value === currentYear);
    if (defaultMonth) this.monthControl.setValue(defaultMonth);
    if (defaultYear) this.yearControl.setValue(defaultYear);

    this.route.params.pipe(takeUntil(this.isComponentActive)).subscribe(params => {
      this.flatId = params['flatId'];
      this.societyId = this.route.snapshot.queryParams['societyId'] || '';
      this.loadReport();
    });
  }

  /**
   * Called by app-filter's (filterChanged) event.
   * The filter object contains extracted values from ALL form controls:
   * { month: 3, year: 2026, statusFilter: 'approved' }
   */
  onFilterChanged(filter: IRentFilter) {
    this.selectedFilter = filter;
    this.loadReport();
  }

  loadReport() {
    if (!this.flatId) return;

    // Values come from selectedFilter (extracted by app-filter) or fall back to defaults
    const month = this.selectedFilter.month || this.monthControl.value?.value || (new Date().getMonth() + 1);
    const year = this.selectedFilter.year || this.yearControl.value?.value || new Date().getFullYear();

    this.loadingReport = true;
    this.rentService.getMonthlyReport(this.flatId, month, year)
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

  getStatusClass(status: string): string {
    return this.rentService.getStatusColorName(status);
  }

  getStatusText(status: string): string {
    return this.rentService.getStatusDisplayText(status);
  }

  // Owner: Record rent payment for a tenant
  openRecordPaymentDialog(entry: IRentReportEntry) {
    this.selectedEntry = entry;
    this.paymentAmount.setValue(entry.payment?.amount ?? entry.rentAmountExpected ?? 0);
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
    if (!this.selectedEntry || !this.societyId) return;

    this.recordingPayment = true;
    const payload = {
      societyId: this.societyId,
      flatId: this.flatId,
      flatMemberId: this.selectedEntry.flatMemberId,
      amount: this.paymentAmount.value,
      month: this.paymentMonth.value,
      year: this.paymentYear.value,
      paidOn: this.paymentDate.value || new Date(),
      note: this.paymentNote.value
    };

    this.rentService.recordPayment(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;
          this.recordingPayment = false;
          this.closeDialog();
          this.loadReport();
        },
        error: () => {
          this.recordingPayment = false;
        }
      });
  }

  viewLogs() {
    this.router.navigate(['/myflats/rent-logs', this.flatId], {
      queryParams: { societyId: this.societyId }
    });
  }

  // Owner: Approve a payment
  onApprove(entry: IRentReportEntry) {
    if (!entry.payment) return;

    this.approving = true;
    this.rentService.approvePayment(entry.payment._id)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;
          this.approving = false;
          this.loadReport();
        },
        error: () => {
          this.approving = false;
        }
      });
  }

  // Owner: Reject a payment
  async onReject(entry: IRentReportEntry) {
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
        this.rentService.rejectPayment(entry.payment!._id, reason)
          .pipe(take(1))
          .subscribe({
            next: response => {
              if (!response.success) return;
              this.rejecting = false;
              this.loadReport();
            },
            error: () => {
              this.rejecting = false;
            }
          });
      }
    });
  }

  onRemind(entry: IRentReportEntry) {
    if (!this.societyId || !this.flatId) return;

    const month = this.selectedFilter.month || (new Date().getMonth() + 1);
    const year = this.selectedFilter.year || new Date().getFullYear();

    this.rentService.sendReminder(
      this.societyId,
      this.flatId,
      entry.flatMemberId,
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
    if (!this.societyId || !this.flatId) return;

    const month = this.selectedFilter.month || (new Date().getMonth() + 1);
    const year = this.selectedFilter.year || new Date().getFullYear();

    this.dialogService.showConfirmation({
      message: `Send rent reminders to all pending tenants for ${this.rentService.getMonthFullName(month)} ${year}?`,
      icon: 'notifications',
      actionButtons: [
        { label: 'Cancel', result: false, class: 'cancel', onClick: () => { } },
        { label: 'Send All', result: true, class: 'primary', onClick: () => { } }
      ]
    }, 10000).subscribe(confirm => {
      if (confirm) {
        this.rentService.sendReminderAll(this.societyId, this.flatId, month, year)
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
