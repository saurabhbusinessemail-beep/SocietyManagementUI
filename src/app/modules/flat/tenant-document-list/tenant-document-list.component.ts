import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { TenantDocumentService } from '../../../services/tenant-document.service';
import { SocietyService } from '../../../services/society.service';
import { WindowService } from '../../../services/window.service';
import { DialogService } from '../../../services/dialog.service';
import { ITenantDocument, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tenant-document-list',
  templateUrl: './tenant-document-list.component.html',
  styleUrl: './tenant-document-list.component.scss'
})
export class TenantDocumentListComponent implements OnInit, OnDestroy {
  isComponentActive = new Subject<void>();

  // Data
  documents: ITenantDocument[] = [];
  filteredDocuments: ITenantDocument[] = [];
  flatId: string = '';
  societyId: string = '';
  subtitle: string = '';

  // Loading states
  loading = false;
  processing = false;

  // Filters
  statusControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  statusConfig!: IUIControlConfig<IUIDropdownOption | undefined | null>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenantDocumentService: TenantDocumentService,
    private societyService: SocietyService,
    public windowService: WindowService,
    private dialogService: DialogService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) { }

  initFilterConfigs() {
    this.statusConfig = {
      id: 'status',
      label: this.translate.instant('TENANT_DOCS.STATUS') || 'Status',
      formControl: this.statusControl,
      dropDownOptions: [
        { value: 'all', label: this.translate.instant('TENANT_DOCS.ALL') || 'All' },
        { value: 'pending', label: this.translate.instant('TENANT_DOCS.PENDING') || 'Pending' },
        { value: 'approved', label: this.translate.instant('TENANT_DOCS.APPROVED') || 'Approved' },
        { value: 'rejected', label: this.translate.instant('TENANT_DOCS.REJECTED') || 'Rejected' }
      ]
    };
    const val = this.statusControl.value;
    if (val) {
      const matched = (this.statusConfig.dropDownOptions || []).find(o => o.value === val.value);
      if (matched) this.statusControl.setValue(matched, { emitEvent: false });
    }
  }

  ngOnInit(): void {
    this.initFilterConfigs();
    this.translate.onLangChange.pipe(takeUntil(this.isComponentActive)).subscribe(() => {
      this.initFilterConfigs();
    });

    const allOption = this.statusConfig.dropDownOptions?.find(o => o.value === 'all');
    if (allOption) this.statusControl.setValue(allOption);

    this.route.params.pipe(takeUntil(this.isComponentActive)).subscribe(params => {
      this.flatId = params['flatId'];
      this.societyId = this.route.snapshot.queryParams['societyId'] || '';
      this.loadDocuments();
      this.loadFlatDetails();
    });

    this.statusControl.valueChanges.pipe(takeUntil(this.isComponentActive)).subscribe(() => {
      this.loadDocuments();
    });
  }

  loadFlatDetails() {
    if (!this.flatId) return;
    this.societyService.getFlat(this.flatId).pipe(take(1)).subscribe(flat => {
      if (flat) {
        const building = typeof flat.buildingId === 'object' ? flat.buildingId?.buildingNumber : '';
        const society = typeof flat.societyId === 'object' ? flat.societyId?.societyName : '';
        this.subtitle = `${society ? society + ' - ' : ''}${building ? 'Building ' + building + ', ' : ''}Flat ${flat.flatNumber}`;
      }
    });
  }

  loadDocuments() {
    if (!this.flatId) return;

    this.loading = true;
    const filter: any = { flatId: this.flatId };
    const statusValue = this.statusControl.value;
    const status = (statusValue && typeof statusValue === 'object') ? statusValue.value : statusValue;

    if (status && status !== 'all') {
      filter.status = status;
    }

    this.tenantDocumentService.getDocuments(filter)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.documents = response.data || [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  get groupedDocuments() {
    const groups: { [key: string]: { tenantName: string, tenantId: string, documents: ITenantDocument[] } } = {};
    
    this.documents.forEach(doc => {
      const tenant = doc.tenantId;
      const tenantId = typeof tenant === 'string' ? tenant : tenant._id;
      const tenantName = typeof tenant === 'string' ? 'Tenant' : (tenant.name || tenant.email || 'Tenant');
      
      if (!groups[tenantId]) {
        groups[tenantId] = { tenantName, tenantId, documents: [] };
      }
      groups[tenantId].documents.push(doc);
    });
    
    return Object.values(groups);
  }

  approveDocument(doc: ITenantDocument) {
    this.processing = true;
    this.tenantDocumentService.updateDocumentStatus(doc._id, 'approved')
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.processing = false;
          if (response.success) {
            this.snackBar.open(this.translate.instant('TENANT_DOCS.APPROVED_MSG') || 'Document approved', 'Close', { duration: 3000 });
            this.loadDocuments();
          }
        },
        error: () => { this.processing = false; }
      });
  }

  rejectDocument(doc: ITenantDocument) {
    this.dialogService.showConfirmation({
      message: this.translate.instant('TENANT_DOCS.REJECT_CONFIRM') || 'Are you sure you want to reject this document?',
      showInput: true,
      inputPlaceholder: this.translate.instant('TENANT_DOCS.REJECT_REASON') || 'Reason for rejection',
      actionButtons: [
        { label: this.translate.instant('COMMON.CANCEL') || 'Cancel', result: false, class: 'cancel' },
        { label: this.translate.instant('TENANT_DOCS.REJECT_ACTION') || 'Reject', result: true, class: 'error' }
      ]
    }, 0).subscribe(result => {
      if (result && (typeof result === 'object' ? result.result : result)) {
        const reason = typeof result === 'object' ? result.inputValue : '';
        this.processing = true;
        this.tenantDocumentService.updateDocumentStatus(doc._id, 'rejected', reason)
          .pipe(take(1))
          .subscribe({
            next: response => {
              this.processing = false;
              if (response.success) {
                this.snackBar.open(this.translate.instant('TENANT_DOCS.REJECTED_MSG') || 'Document rejected', 'Close', { duration: 3000 });
                this.loadDocuments();
              }
            },
            error: () => { this.processing = false; }
          });
      }
    });
  }

  sendReminder(tenantId?: string) {
    const societyId = this.societyId;
    const flatId = this.flatId;

    this.tenantDocumentService.sendDocumentReminder(societyId, flatId, tenantId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response.success) {
            this.snackBar.open(this.translate.instant('TENANT_DOCS.REMINDER_SENT') || 'Reminder sent successfully', 'Close', { duration: 3000 });
          }
        }
      });
  }

  sendReminderToAll() {
    this.dialogService.showConfirmation({
      message: this.translate.instant('TENANT_DOCS.REMINDER_ALL_CONFIRM') || 'Send document submission reminders to all active tenants of this flat?',
      actionButtons: [
        { label: this.translate.instant('COMMON.CANCEL') || 'Cancel', result: false, class: 'cancel' },
        { label: this.translate.instant('TENANT_DOCS.SEND_REMINDER') || 'Send All', result: true, class: 'primary' }
      ]
    }).subscribe(confirmed => {
      if (confirmed) {
        const societyId = this.societyId;
        const flatId = this.flatId;

        this.tenantDocumentService.sendDocumentReminderToAll(societyId, flatId)
          .pipe(take(1))
          .subscribe({
            next: response => {
              if (response.success) {
                this.snackBar.open(this.translate.instant('TENANT_DOCS.REMINDER_ALL_SENT') || 'Reminders sent to all tenants', 'Close', { duration: 3000 });
              }
            }
          });
      }
    });
  }

  downloadDocument(doc: ITenantDocument) {
    const link = document.createElement('a');
    link.href = doc.documentUrl;
    link.download = doc.documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  viewDocument(doc: ITenantDocument) {
    this.dialogService.viewDocument(doc.documentUrl, doc.documentName, doc.documentType);
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
