import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IBEResponseFormat, IComplaint, IPagedResponse, IPagination } from '../interfaces';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Cacheable, InvalidateCache } from '../decorators';
import { PaginationService } from './pagination.service';

@Injectable({
    providedIn: 'root'
})
export class ComplaintService {

    private readonly baseUrl = `${environment.apiBaseUrl}/complaint`;

    private statusTree: { [key: string]: string[] } = {
        submitted: ['approved', 'rejected', 'closed'],
        approved: ['rejected', 'in_progress', 'closed'],
        in_progress: ['rejected', 'resolved'],
        resolved: ['closed'],
    }

    constructor(private http: HttpClient, private paginationService: PaginationService) { }

    /**
     * Create a new complaint
     * Invalidate all complaint list caches when adding a new complaint
     */
    @InvalidateCache({
        methods: [
            'ComplaintService.getComplaints*'
        ],
        groups: ['complaints']
    })
    newComplaint(payload: any): Observable<IBEResponseFormat> {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/add`, payload);
    }

    /**
     * Delete a complaint
     * Invalidate specific complaint and all list caches
     */
    @InvalidateCache({
        methods: [
            'ComplaintService.getComplaintById',
            'ComplaintService.getComplaints*'
        ],
        matchParams: true,
        paramIndices: [0], // Use complaintId for matching
        groups: ['complaints']
    })
    deleteComplaint(complaintId: string): Observable<IBEResponseFormat> {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${complaintId}`);
    }

    /**
     * Get complaints with filters
     * Cache based on societyId, flatId, and complaintType filters
     * Note: This is a POST request but semantically a GET operation, so we cache it
     */
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1, 2], // Use all three filter parameters
        paramKeys: {
            0: ['societyId'], // Extract societyId if it's an object? Currently it's optional string
            1: ['flatId'],     // flatId is a string
            2: ['complaintType'] // complaintType is a string
        },
        group: 'complaints',
        // Custom key generator to handle the fact that parameters are optional
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId, flatId, complaintType] = args;
            // Create a key that only includes provided filters
            const filters: any = {};
            if (societyId) filters.societyId = societyId;
            if (flatId) filters.flatId = flatId;
            if (complaintType) filters.complaintType = complaintType;

            return `${methodName}_${JSON.stringify(filters)}`;
        }
    })
    getComplaints(societyId?: string, flatId?: string, complaintType?: string, status?: string, options: IPagination = {}): Observable<IPagedResponse<IComplaint>> {
        let payload = {};
        if (societyId) payload = { societyId };
        if (flatId) payload = { ...payload, flatId };
        if (status) payload = { ...payload, status };
        if (complaintType) payload = { ...payload, complaintType };

        let params = this.paginationService.createPaginationParams(options);

        return this.http.post<IPagedResponse<IComplaint>>(`${this.baseUrl}`, payload, { params });
    }

    /**
     * Check if status transition is allowed
     * This is a pure function, so we cache it indefinitely (or very long TTL)
     */
    @Cacheable({
        // ttl: 86400000, // 24 hours (rarely changes)
        paramIndices: [0, 1] // Cache based on current and next status
    })
    isStatusTransitionAllowed(currentStatus: string, nextStatus: string): boolean {
        const branch = this.statusTree[currentStatus];
        if (!branch) return false;

        return branch.includes(nextStatus);
    }

    /**
     * Change complaint status
     * Invalidate all complaint lists since status affects filtering
     * Note: If we had a getComplaintById method, we would invalidate that too
     */
    @InvalidateCache({
        methods: [
            'ComplaintService.getComplaintById',
            'ComplaintService.getComplaints*'
        ],
        matchParams: true,
        paramIndices: [0], // Use complaintId for matching
        groups: ['complaints']
    })
    changeStatus(complaintId: string, newStatus: string): Observable<IBEResponseFormat> {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${complaintId}/changeStatus`, { newStatus });
    }

    /**
    * Get single complaint by ID
    * Add this method for more granular caching and invalidation
    */
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0], // Cache based on complaintId
        group: 'complaints'
    })
    getComplaintById(complaintId: string): Observable<IBEResponseFormat<IComplaint>> {
        return this.http.get<IBEResponseFormat<IComplaint>>(`${this.baseUrl}/${complaintId}`);
    }

}