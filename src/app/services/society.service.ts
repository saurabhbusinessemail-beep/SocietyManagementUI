import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IBEResponseFormat, IBuilding, IPagedResponse, ISociety } from '../interfaces';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class SocietyService {

    private readonly baseUrl = `${environment.apiBaseUrl}/societies`;

    constructor(private http: HttpClient) { }

    /* SOCIETY */
    /* Create society */
    createSociety(payload: any): Observable<ISociety> {
        return this.http.post<ISociety>(this.baseUrl, payload);
    }

    /* Get all societies */
    getAllSocieties(): Observable<IPagedResponse<ISociety>> {
        return this.http.get<IPagedResponse<ISociety>>(this.baseUrl);
    }

    /* Get society by ID */
    getSociety(id: string): Observable<ISociety> {
        return this.http.get<ISociety>(`${this.baseUrl}/${id}`);
    }

    /* Update society */
    updateSociety(id: string, payload: any): Observable<ISociety> {
        return this.http.put<ISociety>(`${this.baseUrl}/${id}`, payload);
    }

    /* Delete society */
    deleteSociety(id: string): Observable<string> {
        return this.http.delete<string>(`${this.baseUrl}/${id}`);
    }

    /* Search societies */
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


    /* Manager */
    newManager(societyId: string, payload: any): Observable<IBEResponseFormat> {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/managers`, payload);
    }

    deleteManager(societyId: string, managerId: string): Observable<IBEResponseFormat> {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${societyId}/managers/${managerId}`);
    }


    /* Buildings */
    getBuildings(societyId: string): Observable<IPagedResponse<IBuilding>> {
        return this.http.get<IPagedResponse<IBuilding>>(`${this.baseUrl}/${societyId}/buildings`);
    }

    newBuilding(societyId: string, payload: any) {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/${societyId}/buildings`, payload);
    }

    updateBuilding(societyId: string, buildingId: string, payload: any) {
        return this.http.put<IBEResponseFormat>(`${this.baseUrl}/${societyId}/buildings/${buildingId}`, payload);
    }

    deleteBuilding(societyId: string, buildingId: string) {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${societyId}/buildings/${buildingId}`);
    }
}