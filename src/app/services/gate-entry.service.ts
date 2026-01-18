import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, take } from 'rxjs';
import { IBEResponseFormat, IGateEntry, IPagedResponse } from '../interfaces';
import { GateEntryStatus } from '../types';
import { MatDialog } from '@angular/material/dialog';
import { GateEntryPopupComponent } from '../core/ui/gate-entry-popup/gate-entry-popup.component';

@Injectable({
    providedIn: 'root'
})
export class GateEntryService {

    private baseUrl = `${environment.apiBaseUrl}/gateentry`;

    gateEntryApprovalResponse = new Subject<IGateEntry>();

    constructor(private http: HttpClient, private dialog: MatDialog) { }

    newGateEntry(payload: any): Observable<IBEResponseFormat<IGateEntry>> {
        return this.http.post<IBEResponseFormat<IGateEntry>>(this.baseUrl, payload);
    }

    getGateEntry(gateEntryId: string): Observable<IBEResponseFormat<IGateEntry>> {
        return this.http.get<IBEResponseFormat<IGateEntry>>(`${this.baseUrl}/${gateEntryId}`);
    }

    resendNotification(gateEntryId: string): Observable<IBEResponseFormat<IGateEntry>> {
        return this.http.get<IBEResponseFormat<IGateEntry>>(`${this.baseUrl}/resendNotification/${gateEntryId}`);
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

    handleApprovalNotificationRequest(gateEntryId: string) {
        this.getGateEntry(gateEntryId).pipe(take(1))
            .subscribe(response => {
                if (!response || !response.data) return;

                this.dialog.open(GateEntryPopupComponent, { data: { gateEntry: response.data, isForApproval: true } })
                    .afterClosed().pipe(take(1))
                    .subscribe(response => {
                        if (!response || !response.status) return;

                        this.changeStatus(gateEntryId, response.status).pipe(take(1)).subscribe();
                    })
            })
    }

    handleApprovalNotificationResponse(gateEntryId: string) {
        this.getGateEntry(gateEntryId).pipe(take(1))
            .subscribe(response => {
                if (!response || !response.data) return;

                this.gateEntryApprovalResponse.next(response.data);
            })
    }


}