import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { IApprovalRequest, IApprovalQueryParams, IPagedResponse } from '../../../interfaces';
import { ApprovalService } from '../../../services/approval.service';

type RequestViewType = 'my' | 'approval';

interface IApprovalRequestExtended extends IApprovalRequest {
  viewType: RequestViewType;
}

@Component({
  selector: 'app-pending-flat-approvals',
  templateUrl: './pending-flat-approvals.component.html',
  styleUrl: './pending-flat-approvals.component.scss'
})
export class PendingFlatApprovalsComponent implements OnInit, OnDestroy {
  requests: IApprovalRequestExtended[] = [];
  page = 1;
  limit = 10;
  total = 0;
  searchControl = new FormControl<string>('');
  statusControl = new FormControl<string>('pending');
  viewFilterControl = new FormControl<'all' | 'my' | 'approval'>('all');

  private destroy$ = new Subject<void>();
  expandedRow: number | null = null;
  Math = Math;

  constructor(private approvalService: ApprovalService) { }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => this.loadRequests());

    this.statusControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadRequests());

    this.viewFilterControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadRequests());

    this.loadRequests();
  }

  loadRequests(): void {
    const params: IApprovalQueryParams = {
      page: this.page,
      limit: this.limit,
      requestType: 'FlatMember',
      status: this.statusControl.value || 'pending',
      search: this.searchControl.value || undefined,
      sortBy: 'createdAt:desc'
    };

    this.approvalService.getAllMyRequests(params, params).subscribe({
      next: (res) => {
        let myRequests = (res.myRequests.data || []).map(r => ({
          ...r,
          viewType: 'my' as const
        }));

        let approvalRequests = (res.toApprove.data || []).map(r => ({
          ...r,
          viewType: 'approval' as const
        }));

        // ✅ Apply filter
        const filter = this.viewFilterControl.value;

        if (filter === 'my') {
          this.requests = myRequests;
        } else if (filter === 'approval') {
          this.requests = approvalRequests;
        } else {
          // ✅ My first, then approvals
          this.requests = [...myRequests, ...approvalRequests];
        }

        // Optional: total (approx)
        this.total = res.myRequests.total + res.toApprove.total;
      },
      error: (err) => console.error(err)
    });
  }

  nextPage(): void {
    if (this.page * this.limit < this.total) {
      this.page++;
      this.loadRequests();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadRequests();
    }
  }

  toggleRow(index: number): void {
    this.expandedRow = this.expandedRow === index ? null : index;
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  approve(request: IApprovalRequest): void {
    this.approvalService.approveRequest(request._id).subscribe(() => this.loadRequests());
  }

  reject(request: IApprovalRequest): void {
    this.approvalService.rejectRequest(request._id).subscribe(() => this.loadRequests());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
