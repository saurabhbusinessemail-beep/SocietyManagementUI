import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOTPVerificationResponse } from '../interfaces';
import { ClearCache } from '../decorators';

@Injectable({
    providedIn: 'root'
})
export class NewUserService {

    private baseUrl = `${environment.apiBaseUrl}/newUser`;

    constructor(private http: HttpClient,) { }

    @ClearCache({ clearAll: true })
    newFlatMember(payload: any): Observable<IOTPVerificationResponse> {
        return this.http.post<IOTPVerificationResponse>(`${this.baseUrl}/newFlatMember`, payload);
    }

    @ClearCache({ clearAll: true })
    newSecurity(payload: any): Observable<IOTPVerificationResponse> {
        return this.http.post<IOTPVerificationResponse>(`${this.baseUrl}/newSecurity`, payload);
    }
}