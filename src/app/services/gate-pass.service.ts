import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBEResponseFormat, IGatePass, IPagedResponse } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class GatePassService {

    private baseUrl = `${environment.apiBaseUrl}/gatepass`;

    constructor(private http: HttpClient,) { }

    newGatePass(payload: any): Observable<IBEResponseFormat> {
        return this.http.post<IBEResponseFormat>(this.baseUrl, payload);
    }

    getGattePasses(societyId?: string, flatId?: string): Observable<IPagedResponse<IGatePass>> {
        const payload = { societyId, flatId };
        return this.http.post<IPagedResponse<IGatePass>>(`${this.baseUrl}/myGatePasses`, payload);
    }

    deleteGatePass(gatePassId: string): Observable<IBEResponseFormat> {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${gatePassId}`);
    }
}