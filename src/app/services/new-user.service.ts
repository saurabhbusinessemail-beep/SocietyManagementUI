import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IOTPVerificationResponse } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class NewUserService {

    private baseUrl = `${environment.apiBaseUrl}/newUser`;

    constructor(private http: HttpClient,) { }

    newFlatMember(payload: any): Observable<IOTPVerificationResponse> {
        return this.http.post<IOTPVerificationResponse>(`${this.baseUrl}/newFlatMember`, payload);
    }
}