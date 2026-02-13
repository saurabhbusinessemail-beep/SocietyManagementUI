import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiCallRecord, ApiTrackerService } from '../../services/api-tracker.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-api-tracker',
  templateUrl: './api-tracker.component.html',
  styleUrls: ['./api-tracker.component.scss']
})
export class ApiTrackerComponent implements OnInit {

  apiCalls$!: Observable<ApiCallRecord[]>;

  expandedCallId: string | null = null;

  activeTabs: Record<string, string> = {};

  constructor(private tracker: ApiTrackerService, private dialogRef: MatDialogRef<ApiTrackerComponent>) { }

  ngOnInit(): void {
    this.apiCalls$ = this.tracker.calls$;
  }

  toggle(callId: string): void {
    this.expandedCallId =
      this.expandedCallId === callId ? null : callId;
  }

  setTab(callId: string, tab: string): void {
    this.activeTabs[callId] = tab;
  }

  getTab(callId: string): string {
    return this.activeTabs[callId] || 'response';
  }

  clear(): void {
    this.tracker.clear();
  }

  close() {
    this.dialogRef.close();
  }

  trackById(index: number, item: ApiCallRecord): string {
    return item.id;
  }
}
