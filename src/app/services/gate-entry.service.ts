import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, take } from 'rxjs';
import { IBEResponseFormat, IGateEntry, IPagedResponse } from '../interfaces';
import { GateEntryStatus, UILabelValueType } from '../types';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GateEntryPopupComponent } from '../core/ui/gate-entry-popup/gate-entry-popup.component';
import { Router } from '@angular/router';
import { Cacheable, InvalidateCache } from '../decorators';

@Injectable({
    providedIn: 'root'
})
export class GateEntryService {

    private baseUrl = `${environment.apiBaseUrl}/gateentry`;

    gateEntryRequestPopupRef?: { gateEntryId: string; popupRef: MatDialogRef<GateEntryPopupComponent> };
    gateEntryApprovalResponse = new Subject<IGateEntry>();

    constructor(private http: HttpClient, private dialog: MatDialog, private router: Router) { }

    @Cacheable({
        // ttl: 3600000, // 1 hour - pure function
        paramIndices: [0]
    })
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

    @Cacheable({
        // ttl: 3600000, // 1 hour - pure function
        paramIndices: [0]
    })
    getGateEntryLabelType(gateEntry: IGateEntry): UILabelValueType {
        switch (gateEntry.status) {
            case 'approved': return 'active';
            case 'cancelled': return 'rejected';
            case 'completed': return 'active';
            case 'expired': return 'inactive';
            case 'rejected': return 'rejected';
            case 'requested': return 'pending';
        }
    }

    @InvalidateCache({
        methods: [
            'GateEntryService.getAllMyGateEntries*',
            'GateEntryService.getExitPendingGateEntries*',
            'GateEntryService.getApprovalPendingGateEntries*'
        ],
        groups: ['gateEntries']
    })
    newGateEntry(payload: any): Observable<IBEResponseFormat<IGateEntry>> {
        return this.http.post<IBEResponseFormat<IGateEntry>>(this.baseUrl, payload);
    }

    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0],
        group: 'gateEntries'
    })
    getGateEntry(gateEntryId: string): Observable<IBEResponseFormat<IGateEntry>> {
        return this.http.get<IBEResponseFormat<IGateEntry>>(`${this.baseUrl}/${gateEntryId}`);
    }

    @InvalidateCache({
        methods: [
            'GateEntryService.getGateEntry',
            'GateEntryService.getAllMyGateEntries*',
            'GateEntryService.getExitPendingGateEntries*',
            'GateEntryService.getApprovalPendingGateEntries*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['gateEntries']
    })
    resendNotification(gateEntryId: string): Observable<IBEResponseFormat<IGateEntry>> {
        return this.http.get<IBEResponseFormat<IGateEntry>>(`${this.baseUrl}/resendNotification/${gateEntryId}`);
    }

    @InvalidateCache({
        methods: [
            'GateEntryService.getGateEntry',
            'GateEntryService.getAllMyGateEntries*',
            'GateEntryService.getExitPendingGateEntries*',
            'GateEntryService.getApprovalPendingGateEntries*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['gateEntries']
    })
    markGateExit(gateEntryId: string): Observable<IBEResponseFormat> {
        return this.http.get<IBEResponseFormat>(`${this.baseUrl}/markGateExit/${gateEntryId}`);
    }

    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1, 2, 3],
        paramKeys: {
            0: ['societyId'],
            1: ['flatId'],
            2: ['status'],
            3: ['createdOn']
        },
        group: 'gateEntries',
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId, flatId, status, createdOn] = args;
            const filters: any = {};
            if (societyId) filters.societyId = societyId;
            if (flatId) filters.flatId = flatId;
            if (status) filters.status = status;
            if (createdOn) filters.createdOn = createdOn;
            return `${methodName}_${JSON.stringify(filters)}`;
        }
    })
    getAllMyGateEntries(societyId?: string, flatId?: string, status?: GateEntryStatus, createdOn?: Date): Observable<IPagedResponse<IGateEntry>> {
        let payload: any = { societyId, flatId, status };
        if (createdOn) payload.createdOn = createdOn;
        return this.http.post<IPagedResponse<IGateEntry>>(`${this.baseUrl}/getGateEntries`, payload);
    }

    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1, 2, 3],
        paramKeys: {
            0: ['societyId'],
            1: ['flatId'],
            2: ['status'],
            3: ['createdOn']
        },
        group: 'gateEntries',
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId, flatId, status, createdOn] = args;
            const filters: any = { exitPending: true };
            if (societyId) filters.societyId = societyId;
            if (flatId) filters.flatId = flatId;
            if (status) filters.status = status;
            if (createdOn) filters.createdOn = createdOn;
            return `${methodName}_${JSON.stringify(filters)}`;
        }
    })
    getExitPendingGateEntries(societyId?: string, flatId?: string, status?: GateEntryStatus, createdOn?: Date): Observable<IPagedResponse<IGateEntry>> {
        let payload: any = { societyId, flatId, status, exitPending: true };
        if (createdOn) payload.createdOn = createdOn;
        return this.http.post<IPagedResponse<IGateEntry>>(`${this.baseUrl}/getGateEntries`, payload);
    }

    @Cacheable({
        // ttl: 120000, // 2 minutes - shorter TTL for approval pending
        paramIndices: [0, 1, 2],
        paramKeys: {
            0: ['societyId'],
            1: ['flatId'],
            2: ['createdOn']
        },
        group: 'gateEntries',
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId, flatId, createdOn] = args;
            const filters: any = { status: 'requested', exitPending: true };
            if (societyId) filters.societyId = societyId;
            if (flatId) filters.flatId = flatId;
            if (createdOn) filters.createdOn = createdOn;
            return `${methodName}_${JSON.stringify(filters)}`;
        }
    })
    getApprovalPendingGateEntries(societyId?: string, flatId?: string, createdOn?: Date): Observable<IPagedResponse<IGateEntry>> {
        let payload: any = { societyId, flatId, status: 'requested', exitPending: true };
        if (createdOn) payload.createdOn = createdOn;
        return this.http.post<IPagedResponse<IGateEntry>>(`${this.baseUrl}/getGateEntries`, payload);
    }

    @InvalidateCache({
        methods: [
            'GateEntryService.getGateEntry',
            'GateEntryService.getAllMyGateEntries*',
            'GateEntryService.getExitPendingGateEntries*',
            'GateEntryService.getApprovalPendingGateEntries*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['gateEntries']
    })
    changeStatus(gateEntryId: string, newStatus: GateEntryStatus): Observable<IBEResponseFormat<IGateEntry>> {
        return this.http.post<IBEResponseFormat<IGateEntry>>(`${this.baseUrl}/changeStatus/${gateEntryId}`, { newStatus });
    }

    // Non-HTTP methods - no decorators needed
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
            this.router.navigateByUrl('/visitors/list');
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