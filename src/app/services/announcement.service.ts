import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
    IAnnouncement,
    IBEResponseFormat,
    IPagedResponse,
    IAnnouncementFilters
} from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class AnnouncementService {
    private apiUrl = `${environment.apiBaseUrl}/announcement`;

    constructor(private http: HttpClient) { }

    /**
     * Create a new announcement
     */
    createAnnouncement(data: any): Observable<IBEResponseFormat<IAnnouncement>> {
        return this.http.post<IBEResponseFormat<IAnnouncement>>(this.apiUrl, data);
    }

    /**
     * Get single announcement by ID
     */
    getAnnouncement(id: string): Observable<IBEResponseFormat<IAnnouncement>> {
        return this.http.get<IBEResponseFormat<IAnnouncement>>(`${this.apiUrl}/${id}`);
    }

    /**
     * Get all announcements for a society with pagination and filters
     */
    getSocietyAnnouncements(
        filters: IAnnouncementFilters = { societyId: '' },
        options: {
            page?: number;
            limit?: number;
            search?: string;
            sortBy?: string;
        } = {}
    ): Observable<IPagedResponse<IAnnouncement>> {
        let params = new HttpParams();

        // Add pagination parameters
        if (options.page) params = params.set('page', options.page.toString());
        if (options.limit) params = params.set('limit', options.limit.toString());

        // Add filter parameters
        if (filters.category) params = params.set('category', filters.category);
        if (filters.priority) params = params.set('priority', filters.priority);
        if (filters.status) params = params.set('status', filters.status);
        if (filters.isPublished !== undefined) params = params.set('isPublished', filters.isPublished.toString());
        if (filters.isPinned !== undefined) params = params.set('pinned', filters.isPinned.toString());
        if (options.search) params = params.set('search', options.search);
        if (options.sortBy) params = params.set('sortBy', options.sortBy);

        return this.http.get<IPagedResponse<IAnnouncement>>(
            `${this.apiUrl}/society/${filters.societyId}`,
            { params }
        );
    }

    /**
     * Update announcement
     */
    updateAnnouncement(id: string, updates: IAnnouncement): Observable<IBEResponseFormat<IAnnouncement>> {
        return this.http.put<IBEResponseFormat<IAnnouncement>>(`${this.apiUrl}/${id}`, updates);
    }

    /**
     * Delete announcement
     */
    deleteAnnouncement(id: string): Observable<IBEResponseFormat<void>> {
        return this.http.delete<IBEResponseFormat<void>>(`${this.apiUrl}/${id}`);
    }

    /**
     * Toggle pin status
     */
    togglePinAnnouncement(id: string): Observable<IBEResponseFormat<{ isPinned: boolean }>> {
        return this.http.patch<IBEResponseFormat<{ isPinned: boolean }>>(`${this.apiUrl}/${id}/pin`, {});
    }

    /**
     * Get announcement statistics
     */
    getAnnouncementStats(societyId: string): Observable<IBEResponseFormat<any>> {
        return this.http.get<IBEResponseFormat<any>>(`${this.apiUrl}/stats/${societyId}`);
    }

    /**
     * Search announcements
     */
    searchAnnouncements(
        societyId: string,
        searchTerm: string,
        options: { page?: number; limit?: number } = {}
    ): Observable<IPagedResponse<IAnnouncement>> {
        let params = new HttpParams().set('q', searchTerm);

        if (options.page) params = params.set('page', options.page.toString());
        if (options.limit) params = params.set('limit', options.limit.toString());

        return this.http.get<IPagedResponse<IAnnouncement>>(
            `${this.apiUrl}/society/${societyId}/search`,
            { params }
        );
    }

    /**
     * Get announcements by category
     */
    getAnnouncementsByCategory(
        societyId: string,
        category: string,
        filters: { page?: number; limit?: number } = {}
    ): Observable<IPagedResponse<IAnnouncement>> {
        let params = new HttpParams();

        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());

        return this.http.get<IPagedResponse<IAnnouncement>>(
            `${this.apiUrl}/society/${societyId}/category/${category}`,
            { params }
        );
    }

    /**
     * Get announcements by priority
     */
    getAnnouncementsByPriority(
        societyId: string,
        priority: string,
        filters: { page?: number; limit?: number } = {}
    ): Observable<IPagedResponse<IAnnouncement>> {
        let params = new HttpParams();

        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());

        return this.http.get<IPagedResponse<IAnnouncement>>(
            `${this.apiUrl}/society/${societyId}/priority/${priority}`,
            { params }
        );
    }

    /**
     * Bulk update announcements
     */
    bulkUpdateAnnouncements(
        ids: string[],
        updates: Partial<IAnnouncement>
    ): Observable<IBEResponseFormat<{ matchedCount: number; modifiedCount: number }>> {
        return this.http.post<IBEResponseFormat<{ matchedCount: number; modifiedCount: number }>>(
            `${this.apiUrl}/bulk-update`,
            { ids, updates }
        );
    }

    /**
     * Export announcements
     */
    exportAnnouncements(societyId: string, format: 'json' | 'csv' = 'json'): Observable<any> {
        const params = new HttpParams().set('format', format);

        if (format === 'csv') {
            return this.http.get(`${this.apiUrl}/society/${societyId}/export`, {
                params,
                responseType: 'text'
            });
        }

        return this.http.get<IBEResponseFormat<IAnnouncement[]>>(
            `${this.apiUrl}/society/${societyId}/export`,
            { params }
        );
    }

    /**
     * Get pinned announcements
     */
    getPinnedAnnouncements(
        societyId: string,
        filters: { page?: number; limit?: number } = {}
    ): Observable<IPagedResponse<IAnnouncement>> {
        let params = new HttpParams();

        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());

        return this.http.get<IPagedResponse<IAnnouncement>>(
            `${this.apiUrl}/society/${societyId}/pinned`,
            { params }
        );
    }

    /**
     * Get upcoming announcements (not expired)
     */
    getUpcomingAnnouncements(
        societyId: string,
        filters: { page?: number; limit?: number } = {}
    ): Observable<IPagedResponse<IAnnouncement>> {
        let params = new HttpParams();

        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());

        return this.http.get<IPagedResponse<IAnnouncement>>(
            `${this.apiUrl}/society/${societyId}/upcoming`,
            { params }
        );
    }

    /**
     * Publish an announcement
     */
    publishAnnouncement(id: string): Observable<IBEResponseFormat<IAnnouncement>> {
        return this.http.patch<IBEResponseFormat<IAnnouncement>>(`${this.apiUrl}/${id}/publish`, {});
    }

    /**
     * Unpublish an announcement
     */
    unpublishAnnouncement(id: string): Observable<IBEResponseFormat<IAnnouncement>> {
        return this.http.patch<IBEResponseFormat<IAnnouncement>>(`${this.apiUrl}/${id}/unpublish`, {});
    }

    /**
     * Track view for an announcement
     */
    trackView(id: string): Observable<IBEResponseFormat<{ viewCount: number; hasViewed: boolean; lastViewedAt: Date }>> {
        return this.http.post<IBEResponseFormat<{ viewCount: number; hasViewed: boolean; lastViewedAt: Date }>>(
            `${this.apiUrl}/${id}/view`,
            {}
        );
    }
}