import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBEResponseFormat, IGateEntry, IPagedResponse } from '../interfaces';
import { GateEntryStatus } from '../types';

@Injectable({
    providedIn: 'root'
})
export class GateEntryService {

    private baseUrl = `${environment.apiBaseUrl}/gateentry`;

    constructor(private http: HttpClient,) { }

    newGateEntry(payload: any): Observable<IBEResponseFormat<IGateEntry>> {
        return this.http.post<IBEResponseFormat<IGateEntry>>(this.baseUrl, payload);
    }

    resendNotification(gateEntryId: string): Observable<IBEResponseFormat> {
        return this.http.get<IBEResponseFormat>(`${this.baseUrl}/resendNotification/${gateEntryId}`);
    }

    getAllMyGateEntries(societyId?: string, flatId?: string, status?: GateEntryStatus, createdOn?: Date): Observable<IPagedResponse<IGateEntry>> {
        let payload: any = { societyId, flatId, status };
        if (createdOn) payload.createdOn = createdOn;
        return this.http.post<IPagedResponse<IGateEntry>>(`${this.baseUrl}/getGateEntries`, payload);
    }

    getExitPendingGateEntries(societyId?: string, flatId?: string, status?: GateEntryStatus, createdOn?: Date): Observable<IPagedResponse<IGateEntry>> {
        let payload: any = { societyId, flatId, status, exitPending: true };
        if (createdOn) payload.createdOn = createdOn;
        return this.http.post<IPagedResponse<IGateEntry>>(`${this.baseUrl}/getGateEntries`, payload);
    }

    getApprovalPendingGateEntries(societyId?: string, flatId?: string, createdOn?: Date): Observable<IPagedResponse<IGateEntry>> {
        let payload: any = { societyId, flatId, status: 'requested', exitPending: true };
        if (createdOn) payload.createdOn = createdOn;
        return this.http.post<IPagedResponse<IGateEntry>>(`${this.baseUrl}/getGateEntries`, payload);
    }

    changeStatus(gateEntryId: string, newStatus: GateEntryStatus): Observable<IBEResponseFormat<IGateEntry>> {
        return this.http.post<IBEResponseFormat<IGateEntry>>(`${this.baseUrl}/changeStatus/${gateEntryId}`, { newStatus });
    }
}