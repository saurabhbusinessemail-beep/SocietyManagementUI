import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBEResponseFormat, IGateEntry } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class GateEntryService {

    private baseUrl = `${environment.apiBaseUrl}/gateentry`;

    constructor(private http: HttpClient,) { }

    newGateEntry(payload: any): Observable<IBEResponseFormat<IGateEntry>> {
        return this.http.post<IBEResponseFormat<IGateEntry>>(this.baseUrl, payload);
    }
}