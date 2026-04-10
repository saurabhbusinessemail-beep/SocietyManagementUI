import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginationService } from './pagination.service';
import { IBEResponseFormat, IPagedResponse } from '../interfaces';
import { IApprovalRequest, IApprovalQueryParams } from '../interfaces/approval-request.interface';

@Injectable({
    providedIn: 'root'
})
export class ApprovalService {
    private readonly baseUrl = `${environment.apiBaseUrl}/approvals`;

    constructor(
        private http: HttpClient,
        private paginationService: PaginationService
    ) { }

    getMyRequests(params: IApprovalQueryParams = {}): Observable<IPagedResponse<IApprovalRequest>> {
        const httpParams = this.buildHttpParams(params);
        return this.http.get<IPagedResponse<IApprovalRequest>>(`${this.baseUrl}/my-requests`, { params: httpParams });
    }

    getRequestsToApprove(params: IApprovalQueryParams = {}): Observable<IPagedResponse<IApprovalRequest>> {
        const httpParams = this.buildHttpParams(params);
        return this.http.get<IPagedResponse<IApprovalRequest>>(`${this.baseUrl}/to-approve`, { params: httpParams });
    }

    getAllMyRequests(
        myParams: IApprovalQueryParams = {},
        pendingParams: IApprovalQueryParams = {}
    ): Observable<{ success: boolean; myRequests: IPagedResponse<IApprovalRequest>; toApprove: IPagedResponse<IApprovalRequest> }> {
        let httpParams = this.paginationService.createPaginationParams(myParams);
        // Append my- prefixed params for myRequests
        httpParams = this.appendPrefixedParams(httpParams, myParams, 'my');
        // Append pending- prefixed params for pendingRequests
        httpParams = this.appendPrefixedParams(httpParams, pendingParams, 'pending');
        return this.http.get<any>(`${this.baseUrl}/all`, { params: httpParams });
    }

    approveRequest(requestId: string): Observable<IBEResponseFormat<{ approvalRequest: IApprovalRequest; createdRecord: any }>> {
        return this.http.post<IBEResponseFormat<any>>(`${this.baseUrl}/${requestId}/approve`, {});
    }

    rejectRequest(requestId: string, reason?: string): Observable<IBEResponseFormat<IApprovalRequest>> {
        return this.http.post<IBEResponseFormat<IApprovalRequest>>(`${this.baseUrl}/${requestId}/reject`, { reason });
    }

    // ---------- Helper methods ----------
    private buildHttpParams(params: IApprovalQueryParams): HttpParams {
        let httpParams = this.paginationService.createPaginationParams(params);
        if (params.requestType) httpParams = httpParams.set('requestType', params.requestType);
        if (params.status) httpParams = httpParams.set('status', params.status);
        if (params.flatNumber) httpParams = httpParams.set('flatNumber', params.flatNumber);
        if (params.societyName) httpParams = httpParams.set('societyName', params.societyName);
        if (params.requesterName) httpParams = httpParams.set('requesterName', params.requesterName);
        if (params.requesterContact) httpParams = httpParams.set('requesterContact', params.requesterContact);
        if (params.securityPersonName) httpParams = httpParams.set('securityPersonName', params.securityPersonName);
        if (params.securityPersonContact) httpParams = httpParams.set('securityPersonContact', params.securityPersonContact);
        if (params.search) httpParams = httpParams.set('search', params.search);
        return httpParams;
    }

    private appendPrefixedParams(httpParams: HttpParams, params: IApprovalQueryParams, prefix: string): HttpParams {
        if (params.page) httpParams = httpParams.set(`${prefix}Page`, params.page.toString());
        if (params.limit) httpParams = httpParams.set(`${prefix}Limit`, params.limit.toString());
        if (params.sortBy) httpParams = httpParams.set(`${prefix}SortBy`, params.sortBy);
        if (params.requestType) httpParams = httpParams.set(`${prefix}RequestType`, params.requestType);
        if (params.status) httpParams = httpParams.set(`${prefix}Status`, params.status);
        if (params.flatNumber) httpParams = httpParams.set(`${prefix}FlatNumber`, params.flatNumber);
        if (params.societyName) httpParams = httpParams.set(`${prefix}SocietyName`, params.societyName);
        if (params.requesterName) httpParams = httpParams.set(`${prefix}RequesterName`, params.requesterName);
        if (params.requesterContact) httpParams = httpParams.set(`${prefix}RequesterContact`, params.requesterContact);
        if (params.securityPersonName) httpParams = httpParams.set(`${prefix}SecurityPersonName`, params.securityPersonName);
        if (params.securityPersonContact) httpParams = httpParams.set(`${prefix}SecurityPersonContact`, params.securityPersonContact);
        if (params.search) httpParams = httpParams.set(`${prefix}Search`, params.search);
        return httpParams;
    }
}