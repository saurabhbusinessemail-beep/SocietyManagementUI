import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { IBEResponseFormat, IPagedResponse, ITenantDocument, ITenantDocumentStats } from '../interfaces';
import { Observable } from 'rxjs';
import { Cacheable, InvalidateCache } from '../decorators';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TenantDocumentService {

  private readonly baseUrl = `${environment.apiBaseUrl}/tenant-documents`;

  constructor(private http: HttpClient) { }

  @InvalidateCache({
    methods: ['TenantDocumentService.getDocuments*', 'TenantDocumentService.getDocumentStats*'],
    groups: ['tenantDocuments']
  })
  uploadDocument(payload: Partial<ITenantDocument>): Observable<IBEResponseFormat<ITenantDocument>> {
    return this.http.post<IBEResponseFormat<ITenantDocument>>(this.baseUrl, payload);
  }

  @Cacheable({
    group: 'tenantDocuments',
    paramIndices: [0],
    keyGenerator: (methodName: string, args: any[]) => {
      const filter = args[0] || {};
      return `${methodName}_${JSON.stringify(filter)}`;
    }
  })
  getDocuments(filter: any, page = 1, limit = 20): Observable<IPagedResponse<ITenantDocument>> {
    const params = {
      filter: JSON.stringify(filter),
      page: page.toString(),
      limit: limit.toString()
    };
    return this.http.get<IPagedResponse<ITenantDocument>>(this.baseUrl, { params });
  }

  @InvalidateCache({
    methods: ['TenantDocumentService.getDocuments*', 'TenantDocumentService.getDocumentStats*'],
    groups: ['tenantDocuments']
  })
  updateDocumentStatus(id: string, status: string, rejectionReason?: string): Observable<IBEResponseFormat<ITenantDocument>> {
    return this.http.patch<IBEResponseFormat<ITenantDocument>>(`${this.baseUrl}/${id}/status`, { status, rejectionReason });
  }

  @InvalidateCache({
    methods: ['TenantDocumentService.getDocuments*', 'TenantDocumentService.getDocumentStats*'],
    groups: ['tenantDocuments']
  })
  deleteDocument(id: string): Observable<IBEResponseFormat> {
    return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${id}`);
  }

  sendDocumentReminder(societyId: string, flatId: string, tenantId?: string): Observable<IBEResponseFormat> {
    return this.http.post<IBEResponseFormat>(`${this.baseUrl}/remind`, { societyId, flatId, tenantId });
  }

  sendDocumentReminderToAll(societyId: string, flatId: string): Observable<IBEResponseFormat> {
    return this.http.post<IBEResponseFormat>(`${this.baseUrl}/remind-all`, { societyId, flatId });
  }

  @Cacheable({
    group: 'tenantDocuments',
    paramIndices: [0]
  })
  getDocumentStats(flatId: string): Observable<IBEResponseFormat<ITenantDocumentStats[]>> {
    return this.http.get<IBEResponseFormat<ITenantDocumentStats[]>>(`${this.baseUrl}/stats/${flatId}`);
  }
}
