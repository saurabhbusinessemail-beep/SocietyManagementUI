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

@Component({
  selector: 'app-tenant-document-list',
  templateUrl: './tenant-document-list.component.html',
  styleUrl: './tenant-document-list.component.scss'
})
export class TenantDocumentListComponent implements OnInit, OnDestroy {
  isComponentActive = new Subject<void>();

  // Data
  documents: ITenantDocument[] = [];
  flatId: string = '';
  societyId: string = '';
  subtitle: string = '';

  // Loading states
  loading = false;
  processing = false;

  // Filters
  statusControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  statusConfig: IUIControlConfig<IUIDropdownOption | undefined | null> = {
    id: 'status',
    label: 'Status',
    formControl: this.statusControl,
    dropDownOptions: [
      { value: 'all', label: 'All' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenantDocumentService: TenantDocumentService,
    private societyService: SocietyService,
    public windowService: WindowService,
    private dialogService: DialogService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
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
    const statusValue = this.statusControl.value as any;
    const status = typeof statusValue === 'object' ? statusValue?.value : statusValue;

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
      const tenant = doc.tenantId as any;
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
            this.snackBar.open('Document approved', 'Close', { duration: 3000 });
            this.loadDocuments();
          }
        },
        error: () => { this.processing = false; }
      });
  }

  rejectDocument(doc: ITenantDocument) {
    this.dialogService.showConfirmation({
      message: 'Are you sure you want to reject this document?',
      showInput: true,
      inputPlaceholder: 'Reason for rejection',
      actionButtons: [
        { label: 'Cancel', result: false, class: 'cancel' },
        { label: 'Reject', result: true, class: 'error' }
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
                this.snackBar.open('Document rejected', 'Close', { duration: 3000 });
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
            this.snackBar.open('Reminder sent successfully', 'Close', { duration: 3000 });
          }
        }
      });
  }

  sendReminderToAll() {
    this.dialogService.showConfirmation({
      message: 'Send document submission reminders to all active tenants of this flat?',
      actionButtons: [
        { label: 'Cancel', result: false, class: 'cancel' },
        { label: 'Send All', result: true, class: 'primary' }
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
                this.snackBar.open('Reminders sent to all tenants', 'Close', { duration: 3000 });
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
