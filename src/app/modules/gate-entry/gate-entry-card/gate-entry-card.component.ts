import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IGateEntry } from '../../../interfaces';

@Component({
  selector: 'app-gate-entry-card',
  templateUrl: './gate-entry-card.component.html',
  styleUrl: './gate-entry-card.component.scss'
})
export class GateEntryCardComponent {
  @Input() gateEntry!: IGateEntry;
  @Input() isActive: boolean = false;

  @Output() cardClick = new EventEmitter<IGateEntry>();
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

  ngOnInit() {
    this.startCountdown();
    this.updateStatus();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  private startCountdown() {
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
    // You might want to update the gateEntry status here
    if (this.gateEntry.status !== 'expired') {
      this.gateEntry.status = 'expired';
    }
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  onCardClick() {
    this.cardClick.emit(this.gateEntry);
  }

  onResend(event: Event) {
    event.stopPropagation(); // Prevent card click from firing
    if (this.isExpired) {
      this.resend.emit(this.gateEntry._id);
      // Reset timer if needed
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

  // Helper method to get status class
  getStatusClass(): string {
    return `status-${this.gateEntry.status}`;
  }

  // Format time for display
  formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
