import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IBEResponseFormat, IDemoBooking, IDemoBookingFilters, IPagedResponse, ITimeSlotAvailability } from '../interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemoService {
  private apiUrl = `${environment.apiBaseUrl}/demo`;

  constructor(private http: HttpClient) { }

  /**
   * Create a new demo booking
   * @param bookingData - The booking data (Partial IDemoBooking)
   * @returns Observable with IBEResponseFormat containing the created booking
   */
  bookDemo(bookingData: Partial<IDemoBooking>): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(this.apiUrl, bookingData);
  }

  /**
   * Get booking by ID
   * @param id - Booking ID
   * @returns Observable with IBEResponseFormat containing the booking
   */
  getBookingById(id: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.get<IBEResponseFormat<IDemoBooking>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get booking by reference number
   * @param reference - Booking reference (e.g., DEMO-240315-1234)
   * @returns Observable with IBEResponseFormat containing the booking
   */
  getBookingByReference(reference: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.get<IBEResponseFormat<IDemoBooking>>(`${this.apiUrl}/reference/${reference}`);
  }

  /**
   * Get all bookings with pagination and filters
   * @param filters - Filter criteria (status, source, date range, search)
   * @param page - Page number
   * @param limit - Items per page
   * @returns Observable with IPagedResponse containing bookings array
   */
  getAllBookings(
    filters: IDemoBookingFilters = {},
    page: number = 1,
    limit: number = 10
  ): Observable<IPagedResponse<IDemoBooking>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Add filters to params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<IPagedResponse<IDemoBooking>>(this.apiUrl, { params });
  }

  /**
   * Check available time slots for a specific date
   * @param date - Date to check (YYYY-MM-DD)
   * @param maxPerSlot - Optional max bookings per slot
   * @returns Observable with IBEResponseFormat containing slot availability
   */
  checkSlotAvailability(
    date: string,
    maxPerSlot?: number
  ): Observable<IBEResponseFormat<ITimeSlotAvailability>> {
    let params = new HttpParams().set('date', date);
    if (maxPerSlot) {
      params = params.set('maxPerSlot', maxPerSlot.toString());
    }

    return this.http.get<IBEResponseFormat<ITimeSlotAvailability>>(
      `${this.apiUrl}/slots`,
      { params }
    );
  }

  /**
   * Update an existing booking
   * @param id - Booking ID
   * @param updateData - Data to update
   * @returns Observable with IBEResponseFormat containing updated booking
   */
  updateBooking(
    id: string,
    updateData: Partial<IDemoBooking>
  ): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.put<IBEResponseFormat<IDemoBooking>>(`${this.apiUrl}/${id}`, updateData);
  }

  /**
   * Reschedule a demo
   * @param id - Booking ID
   * @param newDate - New preferred date
   * @param newTime - New preferred time
   * @param reason - Reason for rescheduling
   * @returns Observable with IBEResponseFormat containing updated booking
   */
  rescheduleDemo(
    id: string,
    newDate: string,
    newTime: string,
    reason?: string
  ): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/reschedule`,
      { newDate, newTime, reason }
    );
  }

  /**
   * Complete a demo
   * @param id - Booking ID
   * @param feedback - Optional feedback from customer
   * @param rating - Optional rating (1-5)
   * @returns Observable with IBEResponseFormat containing completed booking
   */
  completeDemo(
    id: string,
    feedback?: string,
    rating?: number
  ): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/complete`,
      { feedback, rating }
    );
  }

  /**
   * Cancel a demo
   * @param id - Booking ID
   * @param reason - Reason for cancellation
   * @returns Observable with IBEResponseFormat containing cancelled booking
   */
  cancelDemo(
    id: string,
    reason?: string
  ): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/cancel`,
      { reason }
    );
  }

  /**
   * Mark a booking as converted to customer
   * @param id - Booking ID
   * @returns Observable with IBEResponseFormat containing updated booking
   */
  markAsConverted(id: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/convert`,
      {}
    );
  }

  /**
   * Add a follow-up note to a booking
   * @param id - Booking ID
   * @param note - Follow-up note text
   * @returns Observable with IBEResponseFormat containing updated booking
   */
  addFollowUpNote(id: string, note: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/notes`,
      { note }
    );
  }

  /**
   * Assign a booking to a team member
   * @param id - Booking ID
   * @param userId - User ID to assign to
   * @returns Observable with IBEResponseFormat containing updated booking
   */
  assignTo(id: string, userId: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/assign`,
      { userId }
    );
  }

  /**
   * Get dashboard statistics
   * @returns Observable with IBEResponseFormat containing stats
   */
  getDashboardStats(): Observable<IBEResponseFormat<any>> {
    return this.http.get<IBEResponseFormat<any>>(`${this.apiUrl}/dashboard/stats`);
  }

  /**
   * Get bookings by date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param status - Optional status filter
   * @returns Observable with IBEResponseFormat containing bookings array
   */
  getBookingsByDateRange(
    startDate: string,
    endDate: string,
    status?: string
  ): Observable<IBEResponseFormat<IDemoBooking[]>> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<IBEResponseFormat<IDemoBooking[]>>(`${this.apiUrl}/range`, { params });
  }

  /**
   * Delete a single booking
   * @param id - Booking ID
   * @returns Observable with IBEResponseFormat containing success status
   */
  deleteBooking(id: string): Observable<IBEResponseFormat<any>> {
    return this.http.delete<IBEResponseFormat<any>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Bulk delete multiple bookings
   * @param ids - Array of booking IDs to delete
   * @returns Observable with IBEResponseFormat containing deleted count
   */
  bulkDeleteBookings(ids: string[]): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(`${this.apiUrl}/bulk-delete`, { ids });
  }

  /**
   * Export bookings to CSV/Excel
   * @param filters - Optional filters to apply before export
   * @returns Observable with blob data for file download
   */
  exportBookings(filters?: IDemoBookingFilters): Observable<Blob> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  /**
   * Get booking statistics by status
   * @returns Observable with IBEResponseFormat containing status counts
   */
  getStatusStats(): Observable<IBEResponseFormat<any>> {
    return this.http.get<IBEResponseFormat<any>>(`${this.apiUrl}/stats/status`);
  }

  /**
   * Get booking statistics by source
   * @returns Observable with IBEResponseFormat containing source counts
   */
  getSourceStats(): Observable<IBEResponseFormat<any>> {
    return this.http.get<IBEResponseFormat<any>>(`${this.apiUrl}/stats/source`);
  }

  /**
   * Get upcoming demos for the next X days
   * @param days - Number of days to look ahead
   * @returns Observable with IBEResponseFormat containing upcoming bookings
   */
  getUpcomingDemos(days: number = 7): Observable<IBEResponseFormat<IDemoBooking[]>> {
    return this.http.get<IBEResponseFormat<IDemoBooking[]>>(`${this.apiUrl}/upcoming`, {
      params: new HttpParams().set('days', days.toString())
    });
  }

  /**
   * Get today's demos
   * @returns Observable with IBEResponseFormat containing today's bookings
   */
  getTodaysDemos(): Observable<IBEResponseFormat<IDemoBooking[]>> {
    return this.http.get<IBEResponseFormat<IDemoBooking[]>>(`${this.apiUrl}/today`);
  }

  /**
   * Send reminder for a demo
   * @param id - Booking ID
   * @returns Observable with IBEResponseFormat containing success status
   */
  sendReminder(id: string): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(`${this.apiUrl}/${id}/remind`, {});
  }

  /**
   * Bulk send reminders for demos
   * @param ids - Array of booking IDs
   * @returns Observable with IBEResponseFormat containing sent count
   */
  bulkSendReminders(ids: string[]): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(`${this.apiUrl}/bulk-remind`, { ids });
  }

  /**
   * Get booking history/timeline
   * @param id - Booking ID
   * @returns Observable with IBEResponseFormat containing timeline events
   */
  getBookingTimeline(id: string): Observable<IBEResponseFormat<any[]>> {
    return this.http.get<IBEResponseFormat<any[]>>(`${this.apiUrl}/${id}/timeline`);
  }

  /**
   * Check if a specific time slot is available
   * @param date - Date to check
   * @param time - Time slot to check
   * @returns Observable with IBEResponseFormat containing availability status
   */
  checkTimeSlotAvailability(date: string, time: string): Observable<IBEResponseFormat<{ available: boolean }>> {
    return this.http.get<IBEResponseFormat<{ available: boolean }>>(
      `${this.apiUrl}/check-slot`,
      { params: new HttpParams().set('date', date).set('time', time) }
    );
  }

  /**
   * Get all available time slots for a date range
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Observable with IBEResponseFormat containing availability for each date
   */
  getAvailabilityCalendar(startDate: string, endDate: string): Observable<IBEResponseFormat<any[]>> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<IBEResponseFormat<any[]>>(`${this.apiUrl}/availability-calendar`, { params });
  }

  /**
 * Approve a demo booking
 * @param id - Booking ID
 * @returns Observable with IBEResponseFormat containing approved booking
 */
  approveDemo(id: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/approve`,
      {}
    );
  }

  /**
   * Reject a demo booking
   * @param id - Booking ID
   * @param reason - Reason for rejection
   * @returns Observable with IBEResponseFormat containing rejected booking
   */
  rejectDemo(id: string, reason?: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/reject`,
      { reason }
    );
  }

  /**
   * Confirm a demo booking (after approval)
   * @param id - Booking ID
   * @returns Observable with IBEResponseFormat containing confirmed booking
   */
  confirmDemo(id: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/confirm`,
      {}
    );
  }

  /**
   * Mark demo as no-show
   * @param id - Booking ID
   * @returns Observable with IBEResponseFormat containing updated booking
   */
  markAsNoShow(id: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/no-show`,
      {}
    );
  }

  /**
   * Bulk approve multiple bookings
   * @param ids - Array of booking IDs to approve
   * @returns Observable with IBEResponseFormat containing results
   */
  bulkApproveBookings(ids: string[]): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(`${this.apiUrl}/bulk-approve`, { ids });
  }

  /**
   * Bulk reject multiple bookings
   * @param ids - Array of booking IDs to reject
   * @param reason - Reason for rejection
   * @returns Observable with IBEResponseFormat containing results
   */
  bulkRejectBookings(ids: string[], reason?: string): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(`${this.apiUrl}/bulk-reject`, { ids, reason });
  }
}