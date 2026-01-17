import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, Inject } from '@angular/core';
import { IGateEntry } from '../../../interfaces';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-gate-entry-popup',
  templateUrl: './gate-entry-popup.component.html',
  styleUrl: './gate-entry-popup.component.scss'
})
export class GateEntryPopupComponent implements OnInit, OnDestroy {
  @Input() gateEntry: IGateEntry | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() resend = new EventEmitter<string>(); // Emits gateEntry ID

  remainingTime: string = '00:30';
  isExpired: boolean = false;
  timerClass: string = '';
  private timerInterval: any;
  private totalSeconds: number = 30;
  private currentSeconds: number = 30;

  get Society() {
    return this.gateEntry && typeof this.gateEntry.societyId !== 'string' ? this.gateEntry.societyId : undefined
  }

  get Flat() {
    return this.gateEntry && typeof this.gateEntry.flatId !== 'string' ? this.gateEntry.flatId : undefined
  }

  constructor(
    public dialogRef: MatDialogRef<GateEntryPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { gateEntry: IGateEntry }
  ) { }

  ngOnInit() {
    this.gateEntry = this.data.gateEntry;
    if (this.gateEntry) {
      this.startCountdown();
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  private startCountdown() {
    if (!this.gateEntry) return;

    // Calculate initial time from createdOn timestamp
    const createdTime = new Date(this.gateEntry.createdOn).getTime();
    const now = new Date().getTime();
    const elapsedSeconds = Math.floor((now - createdTime) / 1000);

    this.currentSeconds = Math.max(0, this.totalSeconds - elapsedSeconds);
    this.updateTimerDisplay();

    if (this.currentSeconds > 0) {
      this.timerInterval = setInterval(() => {
        this.currentSeconds--;
        this.updateTimerDisplay();
        this.updateStatus();

        if (this.currentSeconds <= 0) {
          this.clearTimer();
          this.isExpired = true;
          this.onExpired();
        }
      }, 1000);
    } else {
      this.isExpired = true;
      this.onExpired();
    }
  }

  private updateTimerDisplay() {
    const minutes = Math.floor(this.currentSeconds / 60);
    const seconds = this.currentSeconds % 60;
    this.remainingTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Update timer class based on remaining time
    if (this.currentSeconds <= 10) {
      this.timerClass = 'expiring';
    } else if (this.currentSeconds <= 0) {
      this.timerClass = 'expired';
    } else {
      this.timerClass = '';
    }
  }

  private updateStatus() {
    if (this.currentSeconds <= 0) {
      this.isExpired = true;
    }
  }

  private onExpired() {
    this.timerClass = 'expired';
    this.remainingTime = '00:00';
    // Update the gateEntry status if needed
    if (this.gateEntry && this.gateEntry.status !== 'expired') {
      this.gateEntry.status = 'expired';
    }
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  closeModal() {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent) {
    // Close modal when clicking on overlay (outside modal content)
    const target = event.target as HTMLElement;
    if (target.classList.contains('gate-modal-overlay')) {
      this.closeModal();
    }
  }

  onResend() {
    if (this.gateEntry && this.isExpired) {
      this.resend.emit(this.gateEntry._id);
      // Reset timer
      this.resetTimer();
    }
  }

  private resetTimer() {
    this.clearTimer();
    this.currentSeconds = this.totalSeconds;
    this.isExpired = false;
    this.timerClass = '';
    this.startCountdown();
  }

  // Helper methods for template
  getStatusClass(): string {
    return this.gateEntry ? `status-${this.gateEntry.status}` : 'status-pending';
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  hasVehicleInfo(): boolean {
    return !!this.gateEntry?.vehicleNumber;
  }

  // Get status display text
  getStatusText(): string {
    if (!this.gateEntry) return 'Unknown';

    switch (this.gateEntry.status) {
      case 'requested':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      default:
        return this.gateEntry.status.charAt(0).toUpperCase() + this.gateEntry.status.slice(1);
    }
  }
}
