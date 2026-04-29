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
  IMaintenanceLog
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  private baseUrl = `${environment.apiBaseUrl}/maintenance`;

  constructor(private http: HttpClient) { }

  /**
   * Record a new maintenance payment
   */
  recordPayment(payload: any): Observable<IBEResponseFormat<IMaintenancePayment>> {
    return this.http.post<IBEResponseFormat<IMaintenancePayment>>(this.baseUrl, payload);
  }

  /**
   * Get payments for a flat
   */
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
  getMonthlyReport(societyId: string, month: number, year: number): Observable<IBEResponseFormat<IMaintenanceMonthlyReport>> {
    return this.http.post<IBEResponseFormat<IMaintenanceMonthlyReport>>(
      `${this.baseUrl}/report/monthly`,
      { societyId, month, year }
    );
  }

  /**
   * Get yearly report
   */
  getYearlyReport(societyId: string, year: number): Observable<IBEResponseFormat<IMaintenanceYearlyReport>> {
    return this.http.post<IBEResponseFormat<IMaintenanceYearlyReport>>(
      `${this.baseUrl}/report/yearly`,
      { societyId, year }
    );
  }

  /**
   * Approve a payment
   */
  approvePayment(paymentId: string): Observable<IBEResponseFormat<IMaintenancePayment>> {
    return this.http.post<IBEResponseFormat<IMaintenancePayment>>(
      `${this.baseUrl}/${paymentId}/approve`,
      {}
    );
  }

  /**
   * Reject a payment
   */
  rejectPayment(paymentId: string, reason?: string): Observable<IBEResponseFormat<IMaintenancePayment>> {
    return this.http.post<IBEResponseFormat<IMaintenancePayment>>(
      `${this.baseUrl}/${paymentId}/reject`,
      { reason }
    );
  }

  /**
   * Update a payment (admin edit amount)
   */
  updatePayment(paymentId: string, data: any): Observable<IBEResponseFormat<IMaintenancePayment>> {
    return this.http.put<IBEResponseFormat<IMaintenancePayment>>(
      `${this.baseUrl}/${paymentId}`,
      data
    );
  }

  /**
   * Get pending approvals
   */
  getPendingApprovals(societyId: string): Observable<IBEResponseFormat<IMaintenancePayment[]>> {
    return this.http.get<IBEResponseFormat<IMaintenancePayment[]>>(
      `${this.baseUrl}/pending`,
      { params: { societyId } }
    );
  }


  /**
   * Send reminder to a flat for pending maintenance
   */
  sendReminder(societyId: string, flatId: string, month: number, year: number): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(
      `${this.baseUrl}/remind`,
      { societyId, flatId, month, year }
    );
  }

  /**
   * Send reminder to all flats with pending maintenance
   */
  sendReminderAll(societyId: string, month: number, year: number): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(
      `${this.baseUrl}/remind-all`,
      { societyId, month, year }
    );
  }

  /**
   * Get maintenance summary
   */
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
  getLogs(flatId: string, societyId?: string, month?: number, year?: number): Observable<IBEResponseFormat<IMaintenanceLog[]>> {
    let params: any = {};
    if (societyId) params.societyId = societyId;
    if (month) params.month = month;
    if (year) params.year = year;

    return this.http.get<IBEResponseFormat<IMaintenanceLog[]>>(
      `${this.baseUrl}/logs/flat/${flatId}`,
      { params }
    );
  }
}
