import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../core/error-dialog/error-dialog.component';


@Injectable({
  providedIn: 'root'
})
export class ErrorDialogService {


  private dialogOpen = false;


  constructor(private dialog: MatDialog) { }


  open(title: string, message: string): void {
    if (this.dialogOpen) {
      return;
    }


    this.dialogOpen = true;


    const dialogRef = this.dialog.open(ErrorDialogComponent, {
      disableClose: true,
      data: { title, message }
    });


    dialogRef.afterClosed().subscribe(() => {
      this.dialogOpen = false;
    });
  }
}