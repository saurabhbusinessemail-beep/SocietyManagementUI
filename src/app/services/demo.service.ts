import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IBEResponseFormat, IDemoBooking, IDemoBookingFilters, IPagedResponse, ITimeSlotAvailability } from '../interfaces';
import { Observable } from 'rxjs';
import { Cacheable, InvalidateCache } from '../decorators';

@Injectable({
  providedIn: 'root'
})
export class DemoService {
  private apiUrl = `${environment.apiBaseUrl}/demo`;

  constructor(private http: HttpClient) { }

  /**
   * Create a new demo booking
   * Invalidate all demo lists and dashboard stats when adding a new booking
   */
  @InvalidateCache({
    methods: [
      'DemoService.getAllBookings*',
      'DemoService.getDashboardStats*',
      'DemoService.getUpcomingDemos*',
      'DemoService.getTodaysDemos*',
      'DemoService.getStatusStats*',
      'DemoService.getSourceStats*',
      'DemoService.getBookingsByDateRange*'
    ],
    groups: ['demos']
  })
  bookDemo(bookingData: Partial<IDemoBooking>): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(this.apiUrl, bookingData);
  }

  /**
   * Get booking by ID
   * Cache individual booking for 5 minutes
   */
  @Cacheable({
    // ttl: 300000, // 5 minutes
    paramIndices: [0],
    group: 'demos'
  })
  getBookingById(id: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.get<IBEResponseFormat<IDemoBooking>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get booking by reference number
   * Cache individual booking for 5 minutes
   */
  @Cacheable({
    // ttl: 300000, // 5 minutes
    paramIndices: [0],
    group: 'demos'
  })
  getBookingByReference(reference: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.get<IBEResponseFormat<IDemoBooking>>(`${this.apiUrl}/reference/${reference}`);
  }

  /**
   * Get all bookings with pagination and filters
   * Cache based on filters and pagination parameters
   */
  @Cacheable({
    // ttl: 60000, // 1 minute (shorter TTL for list views)
    paramIndices: [0, 1, 2],
    paramKeys: {
      0: ['status', 'source', 'startDate', 'endDate', 'search'], // Extract specific filter keys
      1: ['page'], // Extract page
      2: ['limit'] // Extract limit
    },
    group: 'demos',
    keyGenerator: (methodName: string, args: any[]) => {
      const [filters = {}, page = 1, limit = 10] = args;
      // Create a deterministic key based on all filter values
      const filterKey = JSON.stringify({
        status: filters.status,
        source: filters.source,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search,
        page,
        limit
      });
      return `${methodName}_${filterKey}`;
    }
  })
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
   * Cache slot availability for 30 seconds (frequently changing)
   */
  @Cacheable({
    // ttl: 30000, // 30 seconds
    paramIndices: [0, 1],
    paramKeys: {
      0: ['date'],
      1: ['maxPerSlot']
    },
    group: 'demos'
  })
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
   * Invalidate specific booking and all list caches
   */
  @InvalidateCache({
    methods: [
      'DemoService.getBookingById',
      'DemoService.getBookingByReference',
      'DemoService.getAllBookings*',
      'DemoService.getDashboardStats*',
      'DemoService.getUpcomingDemos*',
      'DemoService.getTodaysDemos*',
      'DemoService.getBookingsByDateRange*',
      'DemoService.getBookingTimeline*'
    ],
    matchParams: true,
    paramIndices: [0], // Use ID for matching
    groups: ['demos']
  })
  updateBooking(
    id: string,
    updateData: Partial<IDemoBooking>
  ): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.put<IBEResponseFormat<IDemoBooking>>(`${this.apiUrl}/${id}`, updateData);
  }

  /**
   * Reschedule a demo
   * Invalidate specific booking and all list caches
   */
  @InvalidateCache({
    methods: [
      'DemoService.getBookingById',
      'DemoService.getAllBookings*',
      'DemoService.getUpcomingDemos*',
      'DemoService.getTodaysDemos*',
      'DemoService.getBookingsByDateRange*',
      'DemoService.getAvailabilityCalendar*',
      'DemoService.checkSlotAvailability*',
      'DemoService.checkTimeSlotAvailability*'
    ],
    matchParams: true,
    paramIndices: [0], // Use ID for matching
    groups: ['demos']
  })
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
   * Invalidate specific booking and all list caches
   */
  @InvalidateCache({
    methods: [
      'DemoService.getBookingById',
      'DemoService.getAllBookings*',
      'DemoService.getDashboardStats*',
      'DemoService.getStatusStats*',
      'DemoService.getUpcomingDemos*',
      'DemoService.getTodaysDemos*'
    ],
    matchParams: true,
    paramIndices: [0],
    groups: ['demos']
  })
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
   * Invalidate specific booking and all list caches
   */
  @InvalidateCache({
    methods: [
      'DemoService.getBookingById',
      'DemoService.getAllBookings*',
      'DemoService.getDashboardStats*',
      'DemoService.getStatusStats*',
      'DemoService.getUpcomingDemos*',
      'DemoService.getTodaysDemos*'
    ],
    matchParams: true,
    paramIndices: [0],
    groups: ['demos']
  })
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
   * Invalidate specific booking and all list caches
   */
  @InvalidateCache({
    methods: [
      'DemoService.getBookingById',
      'DemoService.getAllBookings*',
      'DemoService.getDashboardStats*',
      'DemoService.getStatusStats*'
    ],
    matchParams: true,
    paramIndices: [0],
    groups: ['demos']
  })
  markAsConverted(id: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/convert`,
      {}
    );
  }

  /**
   * Add a follow-up note to a booking
   * Invalidate specific booking and timeline
   */
  @InvalidateCache({
    methods: [
      'DemoService.getBookingById',
      'DemoService.getBookingTimeline*'
    ],
    matchParams: true,
    paramIndices: [0],
    groups: ['demos']
  })
  addFollowUpNote(id: string, note: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/notes`,
      { note }
    );
  }

  /**
   * Assign a booking to a team member
   * Invalidate specific booking and lists
   */
  @InvalidateCache({
    methods: [
      'DemoService.getBookingById',
      'DemoService.getAllBookings*',
      'DemoService.getUpcomingDemos*',
      'DemoService.getTodaysDemos*'
    ],
    matchParams: true,
    paramIndices: [0],
    groups: ['demos']
  })
  assignTo(id: string, userId: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/assign`,
      { userId }
    );
  }

  /**
   * Get dashboard statistics
   * Cache stats for 5 minutes
   */
  @Cacheable({
    // ttl: 300000, // 5 minutes
    group: 'demos'
  })
  getDashboardStats(): Observable<IBEResponseFormat<any>> {
    return this.http.get<IBEResponseFormat<any>>(`${this.apiUrl}/dashboard/stats`);
  }

  /**
   * Get bookings by date range
   * Cache based on date range and status
   */
  @Cacheable({
    // ttl: 60000, // 1 minute
    paramIndices: [0, 1, 2],
    paramKeys: {
      0: ['startDate'],
      1: ['endDate'],
      2: ['status']
    },
    group: 'demos'
  })
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
   * Invalidate specific booking and all list caches
   */
  @InvalidateCache({
    methods: [
      'DemoService.getBookingById',
      'DemoService.getAllBookings*',
      'DemoService.getDashboardStats*',
      'DemoService.getUpcomingDemos*',
      'DemoService.getTodaysDemos*',
      'DemoService.getBookingsByDateRange*',
      'DemoService.getStatusStats*',
      'DemoService.getSourceStats*'
    ],
    matchParams: true,
    paramIndices: [0],
    groups: ['demos']
  })
  deleteBooking(id: string): Observable<IBEResponseFormat<any>> {
    return this.http.delete<IBEResponseFormat<any>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Bulk delete multiple bookings
   * Invalidate all demo caches
   */
  @InvalidateCache({
    methods: [
      'DemoService.getAllBookings*',
      'DemoService.getDashboardStats*',
      'DemoService.getUpcomingDemos*',
      'DemoService.getTodaysDemos*',
      'DemoService.getBookingsByDateRange*',
      'DemoService.getStatusStats*',
      'DemoService.getSourceStats*'
    ],
    groups: ['demos']
  })
  bulkDeleteBookings(ids: string[]): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(`${this.apiUrl}/bulk-delete`, { ids });
  }

  /**
   * Export bookings to CSV/Excel
   * Cache exports for 10 minutes (exports don't change frequently)
   */
  @Cacheable({
    // ttl: 600000, // 10 minutes
    paramIndices: [0],
    paramKeys: {
      0: ['status', 'source', 'startDate', 'endDate']
    },
    group: 'demos'
  })
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
   * Cache stats for 5 minutes
   */
  @Cacheable({
    // ttl: 300000, // 5 minutes
    group: 'demos'
  })
  getStatusStats(): Observable<IBEResponseFormat<any>> {
    return this.http.get<IBEResponseFormat<any>>(`${this.apiUrl}/stats/status`);
  }

  /**
   * Get booking statistics by source
   * Cache stats for 5 minutes
   */
  @Cacheable({
    // ttl: 300000, // 5 minutes
    group: 'demos'
  })
  getSourceStats(): Observable<IBEResponseFormat<any>> {
    return this.http.get<IBEResponseFormat<any>>(`${this.apiUrl}/stats/source`);
  }

  /**
   * Get upcoming demos for the next X days
   * Cache upcoming demos for 5 minutes
   */
  @Cacheable({
    // ttl: 300000, // 5 minutes
    paramIndices: [0],
    group: 'demos'
  })
  getUpcomingDemos(days: number = 7): Observable<IBEResponseFormat<IDemoBooking[]>> {
    return this.http.get<IBEResponseFormat<IDemoBooking[]>>(`${this.apiUrl}/upcoming`, {
      params: new HttpParams().set('days', days.toString())
    });
  }

  /**
   * Get today's demos
   * Cache today's demos for 1 minute (frequently changing)
   */
  @Cacheable({
    // ttl: 60000, // 1 minute
    group: 'demos'
  })
  getTodaysDemos(): Observable<IBEResponseFormat<IDemoBooking[]>> {
    return this.http.get<IBEResponseFormat<IDemoBooking[]>>(`${this.apiUrl}/today`);
  }

  /**
   * Send reminder for a demo
   * No cache invalidation needed (read operation)
   */
  sendReminder(id: string): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(`${this.apiUrl}/${id}/remind`, {});
  }

  /**
   * Bulk send reminders for demos
   * No cache invalidation needed (read operation)
   */
  bulkSendReminders(ids: string[]): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(`${this.apiUrl}/bulk-remind`, { ids });
  }

  /**
   * Get booking history/timeline
   * Cache timeline for 5 minutes
   */
  @Cacheable({
    // ttl: 300000, // 5 minutes
    paramIndices: [0],
    group: 'demos'
  })
  getBookingTimeline(id: string): Observable<IBEResponseFormat<any[]>> {
    return this.http.get<IBEResponseFormat<any[]>>(`${this.apiUrl}/${id}/timeline`);
  }

  /**
   * Check if a specific time slot is available
   * Cache slot availability for 30 seconds
   */
  @Cacheable({
    // ttl: 30000, // 30 seconds
    paramIndices: [0, 1],
    paramKeys: {
      0: ['date'],
      1: ['time']
    },
    group: 'demos'
  })
  checkTimeSlotAvailability(date: string, time: string): Observable<IBEResponseFormat<{ available: boolean }>> {
    return this.http.get<IBEResponseFormat<{ available: boolean }>>(
      `${this.apiUrl}/check-slot`,
      { params: new HttpParams().set('date', date).set('time', time) }
    );
  }

  /**
   * Get all available time slots for a date range
   * Cache availability calendar for 1 minute
   */
  @Cacheable({
    // ttl: 60000, // 1 minute
    paramIndices: [0, 1],
    paramKeys: {
      0: ['startDate'],
      1: ['endDate']
    },
    group: 'demos'
  })
  getAvailabilityCalendar(startDate: string, endDate: string): Observable<IBEResponseFormat<any[]>> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<IBEResponseFormat<any[]>>(`${this.apiUrl}/availability-calendar`, { params });
  }

  /**
   * Reject a demo booking
   * Invalidate specific booking and all list caches
   */
  @InvalidateCache({
    methods: [
      'DemoService.getBookingById',
      'DemoService.getAllBookings*',
      'DemoService.getDashboardStats*',
      'DemoService.getStatusStats*',
      'DemoService.getUpcomingDemos*',
      'DemoService.getTodaysDemos*'
    ],
    matchParams: true,
    paramIndices: [0],
    groups: ['demos']
  })
  rejectDemo(id: string, reason?: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/reject`,
      { reason }
    );
  }

  /**
   * Confirm a demo booking (after approval)
   * Invalidate specific booking and all list caches
   */
  @InvalidateCache({
    methods: [
      'DemoService.getBookingById',
      'DemoService.getAllBookings*',
      'DemoService.getDashboardStats*',
      'DemoService.getStatusStats*',
      'DemoService.getUpcomingDemos*',
      'DemoService.getTodaysDemos*'
    ],
    matchParams: true,
    paramIndices: [0],
    groups: ['demos']
  })
  confirmDemo(id: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/confirm`,
      {}
    );
  }

  /**
   * Mark demo as no-show
   * Invalidate specific booking and all list caches
   */
  @InvalidateCache({
    methods: [
      'DemoService.getBookingById',
      'DemoService.getAllBookings*',
      'DemoService.getDashboardStats*',
      'DemoService.getStatusStats*',
      'DemoService.getUpcomingDemos*',
      'DemoService.getTodaysDemos*'
    ],
    matchParams: true,
    paramIndices: [0],
    groups: ['demos']
  })
  markAsNoShow(id: string): Observable<IBEResponseFormat<IDemoBooking>> {
    return this.http.post<IBEResponseFormat<IDemoBooking>>(
      `${this.apiUrl}/${id}/no-show`,
      {}
    );
  }

  /**
   * Bulk approve multiple bookings
   * Invalidate all demo caches
   */
  @InvalidateCache({
    methods: [
      'DemoService.getAllBookings*',
      'DemoService.getDashboardStats*',
      'DemoService.getStatusStats*',
      'DemoService.getUpcomingDemos*',
      'DemoService.getTodaysDemos*'
    ],
    groups: ['demos']
  })
  bulkApproveBookings(ids: string[]): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(`${this.apiUrl}/bulk-approve`, { ids });
  }

  /**
   * Bulk reject multiple bookings
   * Invalidate all demo caches
   */
  @InvalidateCache({
    methods: [
      'DemoService.getAllBookings*',
      'DemoService.getDashboardStats*',
      'DemoService.getStatusStats*',
      'DemoService.getUpcomingDemos*',
      'DemoService.getTodaysDemos*'
    ],
    groups: ['demos']
  })
  bulkRejectBookings(ids: string[], reason?: string): Observable<IBEResponseFormat<any>> {
    return this.http.post<IBEResponseFormat<any>>(`${this.apiUrl}/bulk-reject`, { ids, reason });
  }
}