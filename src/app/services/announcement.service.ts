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
import { Cacheable, InvalidateCache } from '../decorators';

@Injectable({
    providedIn: 'root'
})
export class AnnouncementService {
    private apiUrl = `${environment.apiBaseUrl}/announcement`;

    constructor(private http: HttpClient) { }

    /**
     * Create a new announcement
     * Invalidate all announcement list caches when adding a new announcement
     */
    @InvalidateCache({
        methods: [
            'AnnouncementService.getSocietyAnnouncements*',
            'AnnouncementService.getPinnedAnnouncements*',
            'AnnouncementService.getUpcomingAnnouncements*',
            'AnnouncementService.searchAnnouncements*',
            'AnnouncementService.getAnnouncementsByCategory*',
            'AnnouncementService.getAnnouncementsByPriority*'
        ],
        groups: ['announcements']
    })
    createAnnouncement(data: any): Observable<IBEResponseFormat<IAnnouncement>> {
        return this.http.post<IBEResponseFormat<IAnnouncement>>(this.apiUrl, data);
    }

    /**
     * Get single announcement by ID
     * Cache individual announcement for 5 minutes
     */
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0], // Cache based on ID only
        group: 'announcements'
    })
    getAnnouncement(id: string): Observable<IBEResponseFormat<IAnnouncement>> {
        return this.http.get<IBEResponseFormat<IAnnouncement>>(`${this.apiUrl}/${id}`);
    }

    /**
     * Get all announcements for a society with pagination and filters
     * Cache based on societyId, filters, and pagination options
     */
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1], // Use both filters and options
        paramKeys: {
            0: ['societyId', 'category', 'priority', 'status', 'isPublished', 'isPinned'], // Extract specific filter keys
            1: ['page', 'limit', 'search', 'sortBy'] // Extract specific option keys
        },
        group: 'announcements'
    })
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
     * Invalidate specific announcement and all list caches
     */
    @InvalidateCache({
        methods: [
            'AnnouncementService.getAnnouncement', // Invalidate this specific announcement
            'AnnouncementService.getSocietyAnnouncements*',
            'AnnouncementService.getPinnedAnnouncements*',
            'AnnouncementService.getUpcomingAnnouncements*',
            'AnnouncementService.searchAnnouncements*',
            'AnnouncementService.getAnnouncementsByCategory*',
            'AnnouncementService.getAnnouncementsByPriority*',
            'AnnouncementService.getAnnouncementStats*'
        ],
        matchParams: true, // Only invalidate getAnnouncement with matching ID
        paramIndices: [0], // Use ID parameter for matching
        groups: ['announcements']
    })
    updateAnnouncement(id: string, updates: IAnnouncement): Observable<IBEResponseFormat<IAnnouncement>> {
        return this.http.put<IBEResponseFormat<IAnnouncement>>(`${this.apiUrl}/${id}`, updates);
    }

    /**
     * Delete announcement
     * Invalidate specific announcement and all list caches
     */
    @InvalidateCache({
        methods: [
            'AnnouncementService.getAnnouncement',
            'AnnouncementService.getSocietyAnnouncements*',
            'AnnouncementService.getPinnedAnnouncements*',
            'AnnouncementService.getUpcomingAnnouncements*',
            'AnnouncementService.searchAnnouncements*',
            'AnnouncementService.getAnnouncementsByCategory*',
            'AnnouncementService.getAnnouncementsByPriority*',
            'AnnouncementService.getAnnouncementStats*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['announcements']
    })
    deleteAnnouncement(id: string): Observable<IBEResponseFormat<void>> {
        return this.http.delete<IBEResponseFormat<void>>(`${this.apiUrl}/${id}`);
    }

    /**
     * Toggle pin status
     * Invalidate specific announcement and pinned announcements cache
     */
    @InvalidateCache({
        methods: [
            'AnnouncementService.getAnnouncement',
            'AnnouncementService.getPinnedAnnouncements*',
            'AnnouncementService.getSocietyAnnouncements*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['announcements']
    })
    togglePinAnnouncement(id: string): Observable<IBEResponseFormat<{ isPinned: boolean }>> {
        return this.http.patch<IBEResponseFormat<{ isPinned: boolean }>>(`${this.apiUrl}/${id}/pin`, {});
    }

    /**
     * Get announcement statistics
     * Cache stats for 10 minutes (longer TTL as stats change less frequently)
     */
    @Cacheable({
        // ttl: 600000, // 10 minutes
        paramIndices: [0], // Cache based on societyId
        group: 'announcements'
    })
    getAnnouncementStats(societyId: string): Observable<IBEResponseFormat<any>> {
        return this.http.get<IBEResponseFormat<any>>(`${this.apiUrl}/stats/${societyId}`);
    }

    /**
     * Search announcements
     * Cache search results based on search term and pagination
     */
    @Cacheable({
        // ttl: 120000, // 2 minutes (shorter TTL for search results)
        paramIndices: [0, 1, 2], // societyId, searchTerm, options
        paramKeys: {
            2: ['page', 'limit'] // Extract pagination keys
        },
        group: 'announcements'
    })
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
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1, 2], // societyId, category, filters
        paramKeys: {
            2: ['page', 'limit'] // Extract pagination keys
        },
        group: 'announcements'
    })
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
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1, 2], // societyId, priority, filters
        paramKeys: {
            2: ['page', 'limit'] // Extract pagination keys
        },
        group: 'announcements'
    })
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
     * Invalidate all announcement caches as bulk update affects multiple announcements
     */
    @InvalidateCache({
        methods: [
            'AnnouncementService.getSocietyAnnouncements*',
            'AnnouncementService.getPinnedAnnouncements*',
            'AnnouncementService.getUpcomingAnnouncements*',
            'AnnouncementService.searchAnnouncements*',
            'AnnouncementService.getAnnouncementsByCategory*',
            'AnnouncementService.getAnnouncementsByPriority*',
            'AnnouncementService.getAnnouncementStats*'
        ],
        groups: ['announcements']
    })
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
     * Cache exports for 10 minutes (exports don't change frequently)
     */
    @Cacheable({
        // ttl: 600000, // 10 minutes
        paramIndices: [0, 1], // societyId, format
        group: 'announcements'
    })
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
    @Cacheable({
        // ttl: 60000, // 1 minute (shorter TTL as pinned status may change frequently)
        paramIndices: [0, 1], // societyId, filters
        paramKeys: {
            1: ['page', 'limit'] // Extract pagination keys
        },
        group: 'announcements'
    })
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
    @Cacheable({
        // ttl: 60000, // 1 minute (shorter TTL as upcoming status changes with time)
        paramIndices: [0, 1], // societyId, filters
        paramKeys: {
            1: ['page', 'limit'] // Extract pagination keys
        },
        group: 'announcements'
    })
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
     * Invalidate specific announcement and all list caches
     */
    @InvalidateCache({
        methods: [
            'AnnouncementService.getAnnouncement',
            'AnnouncementService.getSocietyAnnouncements*',
            'AnnouncementService.getUpcomingAnnouncements*',
            'AnnouncementService.getPinnedAnnouncements*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['announcements']
    })
    publishAnnouncement(id: string): Observable<IBEResponseFormat<IAnnouncement>> {
        return this.http.patch<IBEResponseFormat<IAnnouncement>>(`${this.apiUrl}/${id}/publish`, {});
    }

    /**
     * Unpublish an announcement
     * Invalidate specific announcement and all list caches
     */
    @InvalidateCache({
        methods: [
            'AnnouncementService.getAnnouncement',
            'AnnouncementService.getSocietyAnnouncements*',
            'AnnouncementService.getUpcomingAnnouncements*',
            'AnnouncementService.getPinnedAnnouncements*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['announcements']
    })
    unpublishAnnouncement(id: string): Observable<IBEResponseFormat<IAnnouncement>> {
        return this.http.patch<IBEResponseFormat<IAnnouncement>>(`${this.apiUrl}/${id}/unpublish`, {});
    }

    /**
     * Track view for an announcement
     * Invalidate specific announcement cache to reflect updated view count
     */
    @InvalidateCache({
        methods: [
            'AnnouncementService.getAnnouncement' // Only invalidate the specific announcement
        ],
        matchParams: true,
        paramIndices: [0] // Use ID for matching
    })
    trackView(id: string): Observable<IBEResponseFormat<{ viewCount: number; hasViewed: boolean; lastViewedAt: Date }>> {
        return this.http.post<IBEResponseFormat<{ viewCount: number; hasViewed: boolean; lastViewedAt: Date }>>(
            `${this.apiUrl}/${id}/view`,
            {}
        );
    }
}