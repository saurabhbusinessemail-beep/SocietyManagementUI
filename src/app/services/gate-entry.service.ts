import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, take } from 'rxjs';
import { IBEResponseFormat, IGateEntry, IPagedResponse } from '../interfaces';
import { GateEntryStatus } from '../types';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GateEntryPopupComponent } from '../core/ui/gate-entry-popup/gate-entry-popup.component';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class GateEntryService {

    private baseUrl = `${environment.apiBaseUrl}/gateentry`;

    gateEntryRequestPopupRef?: { gateEntryId: string; popupRef: MatDialogRef<GateEntryPopupComponent> };
    gateEntryApprovalResponse = new Subject<IGateEntry>();

    constructor(private http: HttpClient, private dialog: MatDialog, private router: Router) { }

    getGateEntryStatusColorName(gateEntry: IGateEntry): string {
        switch (gateEntry.status) {
            case 'approved': return 'approved';
            case 'cancelled': return 'rejected';
            case 'completed': return 'approved';
            case 'expired': return 'expired';
            case 'rejected': return 'rejected';
            case 'requested': return 'pending';
        }
    }

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
                console.log('getGateEntry response', response)
                if (!response || !response.data) return;
                if (this.gateEntryRequestPopupRef) this.handlePreviousApprovalPopupClose(gateEntryId);
                console.log('initializeApp complete')

                const popupRef = this.dialog.open(GateEntryPopupComponent, { width: '90%', data: { gateEntry: response.data, isForApproval: true } });
                popupRef.afterClosed().pipe(take(1))
                    .subscribe(response => {
                        console.log('approval response');
                        if (!response || !response.status) return;

                        this.changeStatus(gateEntryId, response.status).pipe(take(1)).subscribe();
                    });
                this.gateEntryRequestPopupRef = { gateEntryId, popupRef };
            })
    }

    handlePreviousApprovalPopupClose(gateEntryId: string) {
        if (!this.gateEntryRequestPopupRef) return;

        this.gateEntryRequestPopupRef.popupRef.close();
        if (this.gateEntryRequestPopupRef.gateEntryId !== gateEntryId) {
            this.router.navigateByUrl('/visitors/list'); // later be replaced by collecting and showing pending approvals as snack bar
        }
        this.gateEntryRequestPopupRef = undefined;
    }

    handleApprovalNotificationResponse(gateEntryId: string) {
        this.getGateEntry(gateEntryId).pipe(take(1))
            .subscribe(response => {
                if (!response || !response.data) return;
                if (this.gateEntryRequestPopupRef) this.handlePreviousApprovalPopupClose(gateEntryId);

                this.gateEntryApprovalResponse.next(response.data);
            })
    }

}