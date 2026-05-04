import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IBEResponseFormat,
  IRentPayment,
  IRentSummary,
  IRentMonthlyReport,
  IRentLog,
  IRentLogsResponse
} from '../interfaces';
import { Cacheable, InvalidateCache } from '../decorators';

@Injectable({
  providedIn: 'root'
})
export class RentService {

  private baseUrl = `${environment.apiBaseUrl}/rent`;

  constructor(private http: HttpClient) { }

  /**
   * Record a new rent payment
   */
  @InvalidateCache({
    methods: [
      'RentService.getPaymentsByFlat*',
      'RentService.getPendingApprovals*',
      'RentService.getRentSummary*',
      'RentService.getLogs*'
    ],
    groups: ['rent']
  })
  recordPayment(payload: any): Observable<IBEResponseFormat<IRentPayment>> {
    return this.http.post<IBEResponseFormat<IRentPayment>>(this.baseUrl, payload);
  }

  /**
   * Get payments for a flat
   */
  @Cacheable({
    paramIndices: [0, 1, 2, 3, 4],
    group: 'rent'
  })
  getPaymentsByFlat(flatId: string, societyId?: string, month?: number, year?: number, flatMemberId?: string): Observable<IBEResponseFormat<IRentPayment[]>> {
    let params: any = {};
    if (societyId) params.societyId = societyId;
    if (month) params.month = month;
    if (year) params.year = year;
    if (flatMemberId) params.flatMemberId = flatMemberId;

    return this.http.get<IBEResponseFormat<IRentPayment[]>>(
      `${this.baseUrl}/flat/${flatId}`,
      { params }
    );
  }

  /**
   * Get monthly report
   */
  @Cacheable({
    paramIndices: [0, 1, 2],
    group: 'rent'
  })
  getMonthlyReport(flatId: string, month: number, year: number): Observable<IBEResponseFormat<IRentMonthlyReport>> {
    return this.http.post<IBEResponseFormat<IRentMonthlyReport>>(
      `${this.baseUrl}/report/monthly`,
      { flatId, month, year }
    );
  }

  /**
   * Approve a payment
   */
  @InvalidateCache({
    methods: [
      'RentService.getPaymentsByFlat*',
      'RentService.getPendingApprovals*',
      'RentService.getRentSummary*',
      'RentService.getLogs*'
    ],
    groups: ['rent']
  })
  approvePayment(paymentId: string): Observable<IBEResponseFormat<IRentPayment>> {
    return this.http.post<IBEResponseFormat<IRentPayment>>(
      `${this.baseUrl}/${paymentId}/approve`,
      {}
    );
  }

  /**
   * Reject a payment
   */
  @InvalidateCache({
    methods: [
      'RentService.getPaymentsByFlat*',
      'RentService.getPendingApprovals*',
      'RentService.getRentSummary*',
      'RentService.getLogs*'
    ],
    groups: ['rent']
  })
  rejectPayment(paymentId: string, reason?: string): Observable<IBEResponseFormat<IRentPayment>> {
    return this.http.post<IBEResponseFormat<IRentPayment>>(
      `${this.baseUrl}/${paymentId}/reject`,
      { reason }
    );
  }

  /**
   * Update a payment (owner edit amount)
   */
  @InvalidateCache({
    methods: [
      'RentService.getPaymentsByFlat*',
      'RentService.getPendingApprovals*',
      'RentService.getRentSummary*',
      'RentService.getLogs*'
    ],
    groups: ['rent']
  })
  updatePayment(paymentId: string, data: any): Observable<IBEResponseFormat<IRentPayment>> {
    return this.http.put<IBEResponseFormat<IRentPayment>>(
      `${this.baseUrl}/${paymentId}`,
      data
    );
  }

  /**
   * Get pending approvals
   */
  @Cacheable({
    paramIndices: [0],
    group: 'rent'
  })
  getPendingApprovals(flatId: string): Observable<IBEResponseFormat<IRentPayment[]>> {
    return this.http.get<IBEResponseFormat<IRentPayment[]>>(
      `${this.baseUrl}/pending`,
      { params: { flatId } }
    );
  }


  /**
   * Send reminder to a tenant for pending rent
   */
  @InvalidateCache({
    methods: [
      'RentService.getLogs*'
    ],
    groups: ['rent']
  })
  sendReminder(societyId: string, flatId: string, tenantId: string, month: number, year: number): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(
      `${this.baseUrl}/remind`,
      { societyId, flatId, tenantId, month, year }
    );
  }

  /**
   * Send reminder to all pending tenants
   */
  @InvalidateCache({
    methods: [
      'RentService.getLogs*'
    ],
    groups: ['rent']
  })
  sendReminderAll(societyId: string, flatId: string, month: number, year: number): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(
      `${this.baseUrl}/remind-all`,
      { societyId, flatId, month, year }
    );
  }

  /**
   * Get rent summary
   */
  @Cacheable({
    paramIndices: [0, 1, 2],
    group: 'rent'
  })
  getRentSummary(flatId: string, month?: number, year?: number): Observable<IBEResponseFormat<IRentSummary>> {
    let params: any = { flatId };
    if (month) params.month = month;
    if (year) params.year = year;

    return this.http.get<IBEResponseFormat<IRentSummary>>(
      `${this.baseUrl}/summary`,
      { params }
    );
  }

  /**
   * Get status color name for display
   */
  getStatusColorName(status: string): string {
    switch (status) {
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      case 'pending_approval': return 'pending';
      case 'not_paid': return 'expired';
      default: return 'pending';
    }
  }

  /**
   * Get status display text
   */
  getStatusDisplayText(status: string): string {
    switch (status) {
      case 'approved': return 'Paid';
      case 'rejected': return 'Rejected';
      case 'pending_approval': return 'Pending Approval';
      case 'not_paid': return 'Not Paid';
      default: return status;
    }
  }

  /**
   * Get month name
   */
  getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1] || '';
  }

  getMonthFullName(month: number): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || '';
  }

  /**
   * Get merged logs (payments + reminders)
   */
  @Cacheable({
    paramIndices: [0, 1, 2, 3],
    group: 'rent'
  })
  getLogs(flatId: string, societyId?: string, month?: number, year?: number): Observable<IBEResponseFormat<IRentLogsResponse>> {
    let params: any = {};
    if (societyId) params.societyId = societyId;
    if (month) params.month = month;
    if (year) params.year = year;

    return this.http.get<IBEResponseFormat<IRentLogsResponse>>(
      `${this.baseUrl}/logs/flat/${flatId}`,
      { params }
    );
  }
}
