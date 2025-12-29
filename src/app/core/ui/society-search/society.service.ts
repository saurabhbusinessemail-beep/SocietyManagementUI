import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IPagedResponse, ISociety, IUser } from '../../../interfaces';

@Injectable({
    providedIn: 'root'
})
export class SocietiesService {

    private baseUrl = `${environment.apiBaseUrl}/societies`;

    constructor(private http: HttpClient) { }

    searchSocieties(
        query: string,
        page = 1,
        limit = 20
    ): Observable<IPagedResponse<ISociety>> {
        let params = new HttpParams()
            .set('q', query)
            .set('page', page)
            .set('limit', limit);

        return this.http.get<IPagedResponse<ISociety>>(
            `${this.baseUrl}/search`,
            { params }
        );
    }
}
