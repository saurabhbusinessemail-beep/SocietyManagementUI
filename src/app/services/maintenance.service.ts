import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IBEResponseFormat,
  IMaintenancePayment,
  IMaintenanceMonthlyReport,
  IMaintenanceYearlyReport,
  IMaintenanceSummary,
  IMaintenanceLog,
  IMaintenanceLogsResponse
} from '../interfaces';
import { Cacheable, InvalidateCache } from '../decorators';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  private baseUrl = `${environment.apiBaseUrl}/maintenance`;

  constructor(private http: HttpClient) { }

  /**
   * Record a new maintenance payment
   */
  @InvalidateCache({
    methods: [
      'MaintenanceService.getPaymentsByFlat*',
      'MaintenanceService.getMonthlyReport*',
      'MaintenanceService.getYearlyReport*',
      'MaintenanceService.getPendingApprovals*',
      'MaintenanceService.getMaintenanceSummary*',
      'MaintenanceService.getLogs*'
    ],
    groups: ['maintenance']
  })
  recordPayment(payload: any): Observable<IBEResponseFormat<IMaintenancePayment>> {
    return this.http.post<IBEResponseFormat<IMaintenancePayment>>(this.baseUrl, payload);
  }

  /**
   * Get payments for a flat
   */
  @Cacheable({
    paramIndices: [0, 1, 2, 3],
    group: 'maintenance'
  })
  getPaymentsByFlat(flatId: string, societyId?: string, month?: number, year?: number): Observable<IBEResponseFormat<IMaintenancePayment[]>> {
    let params: any = {};
    if (societyId) params.societyId = societyId;
    if (month) params.month = month;
    if (year) params.year = year;

    return this.http.get<IBEResponseFormat<IMaintenancePayment[]>>(
      `${this.baseUrl}/flat/${flatId}`,
      { params }
    );
  }

  /**
   * Get monthly report
   */
  @Cacheable({
    paramIndices: [0, 1, 2],
    group: 'maintenance'
  })
  getMonthlyReport(societyId: string, month: number, year: number): Observable<IBEResponseFormat<IMaintenanceMonthlyReport>> {
    return this.http.post<IBEResponseFormat<IMaintenanceMonthlyReport>>(
      `${this.baseUrl}/report/monthly`,
      { societyId, month, year }
    );
  }

  /**
   * Get yearly report
   */
  @Cacheable({
    paramIndices: [0, 1],
    group: 'maintenance'
  })
  getYearlyReport(societyId: string, year: number): Observable<IBEResponseFormat<IMaintenanceYearlyReport>> {
    return this.http.post<IBEResponseFormat<IMaintenanceYearlyReport>>(
      `${this.baseUrl}/report/yearly`,
      { societyId, year }
    );
  }

  /**
   * Approve a payment
   */
  @InvalidateCache({
    methods: [
      'MaintenanceService.getPaymentsByFlat*',
      'MaintenanceService.getMonthlyReport*',
      'MaintenanceService.getYearlyReport*',
      'MaintenanceService.getPendingApprovals*',
      'MaintenanceService.getMaintenanceSummary*',
      'MaintenanceService.getLogs*'
    ],
    groups: ['maintenance']
  })
  approvePayment(paymentId: string): Observable<IBEResponseFormat<IMaintenancePayment>> {
    return this.http.post<IBEResponseFormat<IMaintenancePayment>>(
      `${this.baseUrl}/${paymentId}/approve`,
      {}
    );
  }

  /**
   * Reject a payment
   */
  @InvalidateCache({
    methods: [
      'MaintenanceService.getPaymentsByFlat*',
      'MaintenanceService.getMonthlyReport*',
      'MaintenanceService.getYearlyReport*',
      'MaintenanceService.getPendingApprovals*',
      'MaintenanceService.getMaintenanceSummary*',
      'MaintenanceService.getLogs*'
    ],
    groups: ['maintenance']
  })
  rejectPayment(paymentId: string, reason?: string): Observable<IBEResponseFormat<IMaintenancePayment>> {
    return this.http.post<IBEResponseFormat<IMaintenancePayment>>(
      `${this.baseUrl}/${paymentId}/reject`,
      { reason }
    );
  }

  /**
   * Update a payment (admin edit amount)
   */
  @InvalidateCache({
    methods: [
      'MaintenanceService.getPaymentsByFlat*',
      'MaintenanceService.getMonthlyReport*',
      'MaintenanceService.getYearlyReport*',
      'MaintenanceService.getPendingApprovals*',
      'MaintenanceService.getMaintenanceSummary*',
      'MaintenanceService.getLogs*'
    ],
    groups: ['maintenance']
  })
  updatePayment(paymentId: string, data: any): Observable<IBEResponseFormat<IMaintenancePayment>> {
    return this.http.put<IBEResponseFormat<IMaintenancePayment>>(
      `${this.baseUrl}/${paymentId}`,
      data
    );
  }

  /**
   * Get pending approvals
   */
  @Cacheable({
    paramIndices: [0],
    group: 'maintenance'
  })
  getPendingApprovals(societyId: string): Observable<IBEResponseFormat<IMaintenancePayment[]>> {
    return this.http.get<IBEResponseFormat<IMaintenancePayment[]>>(
      `${this.baseUrl}/pending`,
      { params: { societyId } }
    );
  }


  /**
   * Send reminder to a flat for pending maintenance
   */
  @InvalidateCache({
    methods: [
      'MaintenanceService.getMonthlyReport*',
      'MaintenanceService.getLogs*'
    ],
    groups: ['maintenance']
  })
  sendReminder(societyId: string, flatId: string, month: number, year: number): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(
      `${this.baseUrl}/remind`,
      { societyId, flatId, month, year }
    );
  }

  /**
   * Send reminder to all flats with pending maintenance
   */
  @InvalidateCache({
    methods: [
      'MaintenanceService.getMonthlyReport*',
      'MaintenanceService.getLogs*'
    ],
    groups: ['maintenance']
  })
  sendReminderAll(societyId: string, month: number, year: number): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(
      `${this.baseUrl}/remind-all`,
      { societyId, month, year }
    );
  }

  /**
   * Get maintenance summary
   */
  @Cacheable({
    paramIndices: [0, 1, 2],
    group: 'maintenance'
  })
  getMaintenanceSummary(societyId: string, month?: number, year?: number): Observable<IBEResponseFormat<IMaintenanceSummary>> {
    let params: any = { societyId };
    if (month) params.month = month;
    if (year) params.year = year;

    return this.http.get<IBEResponseFormat<IMaintenanceSummary>>(
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
    group: 'maintenance'
  })
  getLogs(flatId: string, societyId?: string, month?: number, year?: number): Observable<IBEResponseFormat<IMaintenanceLogsResponse>> {
    let params: any = {};
    if (societyId) params.societyId = societyId;
    if (month) params.month = month;
    if (year) params.year = year;

    return this.http.get<IBEResponseFormat<IMaintenanceLogsResponse>>(
      `${this.baseUrl}/logs/flat/${flatId}`,
      { params }
    );
  }
}
