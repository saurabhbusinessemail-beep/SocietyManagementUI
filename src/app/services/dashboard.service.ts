import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IBEResponseFormat, IDashboardApprovals } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly baseUrl = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch all pending approvals for the current user
   */
  getPendingApprovals(): Observable<IBEResponseFormat<IDashboardApprovals>> {
    return this.http.get<IBEResponseFormat<IDashboardApprovals>>(`${this.baseUrl}/approvals`);
  }
}
