import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { TenantDocumentService } from '../../../services/tenant-document.service';
import { SocietyService } from '../../../services/society.service';
import { WindowService } from '../../../services/window.service';
import { ITenantDocument } from '../../../interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogService } from '../../../services/dialog.service';

@Component({
  selector: 'app-tenant-document-manager',
  templateUrl: './tenant-document-manager.component.html',
  styleUrl: './tenant-document-manager.component.scss'
})
export class TenantDocumentManagerComponent implements OnInit, OnDestroy {
  isComponentActive = new Subject<void>();

  // Data
  documents: ITenantDocument[] = [];
  flatId: string = '';
  societyId: string = '';
  flatMemberId: string = '';
  subtitle: string = '';

  // Loading states
  loading = false;
  uploading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenantDocumentService: TenantDocumentService,
    private societyService: SocietyService,
    private dialogService: DialogService,
    public windowService: WindowService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.isComponentActive)).subscribe(params => {
      this.flatId = params['flatId'];
      this.societyId = this.route.snapshot.queryParams['societyId'] || '';
      this.flatMemberId = this.route.snapshot.queryParams['flatMemberId'] || '';
      this.loadDocuments();
      this.loadFlatDetails();
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
    if (this.flatMemberId) {
      filter.flatMemberId = this.flatMemberId;
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

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length === 0) return;

    if (!this.flatMemberId) {
      this.snackBar.open('Error: Membership information missing. Please go back and try again.', 'Close', { duration: 5000 });
      return;
    }
    this.uploading = true;

    // Processing files sequentially to avoid UI blast
    const uploadNext = (index: number) => {
      if (index >= files.length) {
        this.uploading = false;
        return;
      }

      const file = files[index];
      
      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';

      if (!isImage && !isPdf) {
        this.snackBar.open(`File ${file.name} is not a valid document (Only images or PDFs allowed)`, 'Close', { duration: 5000 });
        uploadNext(index + 1);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const dummyUrl = e.target.result;
        const documentType = file.type.startsWith('image') ? 'image' : 'pdf';

        const payload = {
          societyId: this.societyId,
          flatId: this.flatId,
          flatMemberId: this.flatMemberId,
          documentUrl: dummyUrl,
          documentName: file.name,
          documentType
        };

        this.tenantDocumentService.uploadDocument(payload)
          .pipe(take(1))
          .subscribe({
            next: response => {
              if (response.success) {
                this.snackBar.open(`Document ${file.name} uploaded`, 'Close', { duration: 3000 });
                if (index === files.length - 1) this.loadDocuments();
              }
              uploadNext(index + 1);
            },
            error: () => {
              uploadNext(index + 1);
            }
          });
      };
      reader.readAsDataURL(file);
    };

    uploadNext(0);
  }

  deleteDocument(doc: ITenantDocument) {
    this.dialogService.confirmDelete('Delete Document', 'Are you sure you want to delete this document?').then(confirmed => {
      if (confirmed) {
        this.tenantDocumentService.deleteDocument(doc._id)
          .pipe(take(1))
          .subscribe({
            next: response => {
              if (response.success) {
                this.snackBar.open('Document deleted', 'Close', { duration: 3000 });
                this.loadDocuments();
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

  get isMobile(): boolean {
    return this.windowService.mode.value === 'mobile';
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
