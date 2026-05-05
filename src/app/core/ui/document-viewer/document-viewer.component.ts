import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-document-viewer',
  template: `
    <div class="document-viewer-container">
      <div class="viewer-header">
        <h3 class="doc-name">{{ data.name }}</h3>
        <button class="close-btn" (click)="close()">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="viewer-content">
        <img *ngIf="isImage" [src]="data.url" class="doc-image" />
        <iframe *ngIf="isPdf" [src]="data.url | safeUrl" class="doc-pdf"></iframe>
      </div>
      <div class="viewer-footer">
        <button class="download-btn" (click)="download()">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download
        </button>
      </div>
    </div>
  `,
  styles: [`
    .document-viewer-container {
      display: flex;
      flex-direction: column;
      height: 90vh;
      max-height: 800px;
      background: var(--bg-primary);
      overflow: hidden;
    }
    .viewer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .doc-name {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-ellipsis: true;
    }
    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      transition: color 0.2s;
    }
    .close-btn:hover {
      color: var(--text-primary);
    }
    .viewer-content {
      flex: 1;
      overflow: auto;
      display: flex;
      justify-content: center;
      align-items: center;
      background: var(--bg-secondary);
      padding: 16px;
    }
    .doc-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .doc-pdf {
      width: 100%;
      height: 100%;
      border: none;
    }
    .viewer-footer {
      padding: 16px;
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: flex-end;
    }
    .download-btn {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }
  `]
})
export class DocumentViewerComponent {
  constructor(
    public dialogRef: MatDialogRef<DocumentViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string, name: string, type?: string }
  ) {}

  get isImage(): boolean {
    return this.data.url.startsWith('data:image/') || 
           this.data.type === 'image' || 
           /\.(jpg|jpeg|png|gif|webp)$/i.test(this.data.url);
  }

  get isPdf(): boolean {
    return this.data.url.startsWith('data:application/pdf') || 
           this.data.type === 'pdf' || 
           /\.pdf$/i.test(this.data.url);
  }

  close(): void {
    this.dialogRef.close();
  }

  download(): void {
    const link = document.createElement('a');
    link.href = this.data.url;
    link.download = this.data.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
