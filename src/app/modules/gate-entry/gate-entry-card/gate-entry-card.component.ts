import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IGateEntry } from '../../../interfaces';
import { GateEntryService } from '../../../services/gate-entry.service';
import { Subject, takeUntil } from 'rxjs';
import { UILabelValueType } from '../../../types';

@Component({
  selector: 'app-gate-entry-card',
  templateUrl: './gate-entry-card.component.html',
  styleUrl: './gate-entry-card.component.scss'
})
export class GateEntryCardComponent implements OnInit, OnDestroy {

  @Input() gateEntry!: any;
  @Input() showApprovalAction = false;

  @Output() openDetails = new EventEmitter<void>();
  @Output() markExit = new EventEmitter<void>();
  @Output() resendRequest = new EventEmitter<void>();

  timeOutDelay = 30;
  remainingSeconds = this.timeOutDelay;
  isExpired = false;
  isComponentActive = new Subject<void>();

  private timerId!: number;

  constructor(private gateEntryService: GateEntryService) { }

  ngOnInit(): void {
    if (this.gateEntry.status === 'requested')
      this.startCountdown();

    this.subscribeToApprovalResponse();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerId);
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }

  private startCountdown(): void {
    this.updateCountdown();

    this.timerId = window.setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  private updateCountdown(): void {
    if (this.gateEntry.status !== 'requested') {
      clearInterval(this.timerId);
      return;
    }
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

  subscribeToApprovalResponse() {
    const obsApproval = this.gateEntryService.gateEntryApprovalResponse
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(response => {
        console.log('subscribeToApprovalResponse  in gate entry card')
        if (!this.gateEntry || response._id !== this.gateEntry._id) return;

        this.gateEntry.status = this.gateEntry.status;
        this.gateEntry.history = this.gateEntry.history;
        obsApproval.unsubscribe();
      });
  }

  getGateEntryStatusColorName(): string {
    if (!this.gateEntry) return '';

    return this.gateEntryService.getGateEntryStatusColorName(this.gateEntry);
  }

  getGateEntryLabelType(gateEntry: IGateEntry): UILabelValueType {
    return this.gateEntryService.getGateEntryLabelType(gateEntry);
  }
}
