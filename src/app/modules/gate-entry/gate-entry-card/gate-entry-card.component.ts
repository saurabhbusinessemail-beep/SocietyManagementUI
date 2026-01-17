import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IGateEntry } from '../../../interfaces';

@Component({
  selector: 'app-gate-entry-card',
  templateUrl: './gate-entry-card.component.html',
  styleUrl: './gate-entry-card.component.scss'
})
export class GateEntryCardComponent implements OnInit, OnDestroy {
  @Input() gateEntry!: any;

  @Output() openDetails = new EventEmitter<void>();
  @Output() resendRequest = new EventEmitter<void>();

  timeOutDelay = 30;
  remainingSeconds = this.timeOutDelay;
  isExpired = false;

  private timerId!: number;

  ngOnInit(): void {
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

  onResendClick(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.isExpired) return;
    this.resendRequest.emit();
  }
}
