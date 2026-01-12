import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationPopupComponent } from '../core/confirmation/confirmation-popup.component';
import { IConfirmationPopupDataConfig } from '../interfaces';
import { Observable, take } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DialogService {


  private dialogRef?: MatDialogRef<ConfirmationPopupComponent, any>;


  constructor(private dialog: MatDialog) { }


  showConfirmation(data: IConfirmationPopupDataConfig): Observable<any> {
    if (this.dialogRef) {
      this.dialogRef.close();
    }


    this.dialogRef = this.dialog.open(ConfirmationPopupComponent, {
      disableClose: true,
      data
    });

    setTimeout(() => {
      this.dialogRef?.close();
    }, 3000);

    this.dialogRef.afterClosed().pipe(take(1)).subscribe(() => {
      this.dialogRef = undefined;
    });

    return this.dialogRef.afterClosed();
  }
}