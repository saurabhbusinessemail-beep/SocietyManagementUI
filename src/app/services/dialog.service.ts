import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationPopupComponent } from '../core/confirmation/confirmation-popup.component';
import { IConfirmationPopupDataConfig } from '../interfaces';
import { Observable, take } from 'rxjs';
import { ConfirmDeleteComponent } from '../core/delete-confirmation/confirm-delete.component';
import { ProceedConfirmComponent } from '../core/ui/proceed-confirm/proceed-confirm.component';
import { DocumentViewerComponent } from '../core/ui/document-viewer/document-viewer.component';


@Injectable({
  providedIn: 'root'
})
export class DialogService {


  private dialogRef?: MatDialogRef<ConfirmationPopupComponent, any>;


  constructor(private dialog: MatDialog) { }


  showConfirmation(data: IConfirmationPopupDataConfig, timeout = 1500): Observable<any> {
    if (this.dialogRef) {
      this.dialogRef.close();
    }


    this.dialogRef = this.dialog.open(ConfirmationPopupComponent, {
      disableClose: true,
      data
    });

    const isInteractive = data.showInput || (data.actionButtons && data.actionButtons.length > 0);

    if (timeout > 0 && !isInteractive) {
      setTimeout(() => {
        this.dialogRef?.close();
      }, timeout);
    }

    this.dialogRef.afterClosed().pipe(take(1)).subscribe(() => {
      this.dialogRef = undefined;
    });

    return this.dialogRef.afterClosed();
  }

  confirmToProceed(message: string) {
    const ref = this.dialog.open(ProceedConfirmComponent, {
      data: { message }
    });

    return new Promise(resolve => {
      ref.afterClosed()
        .pipe(take(1))
        .subscribe((response: boolean) => {
          resolve(response);
        });
    })
  }

  confirmDelete(title: string, message: string): Promise<boolean> {
    const ref = this.dialog.open(ConfirmDeleteComponent, {
      data: { title, message }
    });

    return new Promise<boolean>(resolve => {
      ref.afterClosed().pipe(take(1)).subscribe((response: boolean) => {
        resolve(response);
      })
    });
  }

  viewDocument(url: string, name: string, type?: string): void {
    this.dialog.open(DocumentViewerComponent, {
      width: '95vw',
      maxWidth: '1000px',
      height: '95vh',
      maxHeight: '850px',
      panelClass: 'document-viewer-dialog',
      data: { url, name, type }
    });
  }
}