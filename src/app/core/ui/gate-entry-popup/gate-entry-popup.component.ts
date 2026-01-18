import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, Inject } from '@angular/core';
import { IGateEntry } from '../../../interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-gate-entry-popup',
  templateUrl: './gate-entry-popup.component.html',
  styleUrl: './gate-entry-popup.component.scss'
})
export class GateEntryPopupComponent implements OnInit, OnDestroy {

  gateEntry!: IGateEntry;
  isForApproval: boolean;

  timeOutDelay = 30;
  remainingSeconds = this.timeOutDelay;
  isExpired = false;

  private timerId!: number;

  get Society() {
    return this.gateEntry && typeof this.gateEntry.societyId !== 'string' ? this.gateEntry.societyId : undefined
  }

  get Flat() {
    return this.gateEntry && typeof this.gateEntry.flatId !== 'string' ? this.gateEntry.flatId : undefined
  }

  constructor(
    public dialogRef: MatDialogRef<GateEntryPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { gateEntry: IGateEntry, isForApproval: boolean }
  ) {
    this.gateEntry = data.gateEntry;
    this.isForApproval = data.isForApproval ?? false;
  }

  ngOnInit(): void {
    if (this.gateEntry.status === 'requested')
      this.startCountdown();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerId);
  }

  private startCountdown(): void {
    this.updateCountdown();

    this.timerId = window.setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  private updateCountdown(): void {
    const createdTime = new Date(this.gateEntry.entryTime).getTime();
    const now = Date.now();

    const elapsedSeconds = Math.floor((now - createdTime) / 1000);
    const remaining = this.timeOutDelay - elapsedSeconds;

    this.remainingSeconds = Math.max(remaining, 0);
    this.isExpired = remaining <= 0;

    if (this.isExpired) {
      clearInterval(this.timerId);
    }
  }

  resendRequest(): void {
    if (!this.isExpired) return;
    this.dialogRef.close({ action: 'resend' });
  }

  approveReject(status: string) {
    if (this.isExpired) return;

    this.dialogRef.close({ status });
  }

  close(): void {
    this.dialogRef.close();
    clearInterval(this.timerId);
  }
}
