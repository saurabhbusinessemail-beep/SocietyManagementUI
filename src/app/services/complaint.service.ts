import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IBEResponseFormat, IComplaint, IPagedResponse } from '../interfaces';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ComplaintStatus } from '../constants';

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

    constructor(private http: HttpClient) { }

    newComplaint(payload: any): Observable<IBEResponseFormat> {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/add`, payload);
    }

    deleteComplaint(complaintId: string): Observable<IBEResponseFormat> {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${complaintId}`);
    }

    getComplaints(societyId?: string, flatId?: string, complaintType?: string): Observable<IPagedResponse<IComplaint>> {
        let payload = {};
        if (societyId) payload = { societyId };
        if (flatId) payload = { ...payload, flatId };
        if (complaintType) payload = { ...payload, complaintType };

        return this.http.post<IPagedResponse<IComplaint>>(`${this.baseUrl}`, payload);
    }

    isStatusTransitionAllowed(currentStatus: string, nextStatus: string): boolean {
        const branch = this.statusTree[currentStatus];
        if (!branch) return false;

        return branch.includes(nextStatus);
    }

    changeStatus(complaintId: string, newStatus: string): Observable<IBEResponseFormat> {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${complaintId}/changeStatus`, { newStatus });
    }

}