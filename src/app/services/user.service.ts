// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../interfaces/user.interface';
import { environment } from '../../environments/environment';
import { IOTPVerificationResponse, IPagedResponse } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private baseUrl = `${environment.apiBaseUrl}/users`; // Adjust based on your API URL

    constructor(private http: HttpClient) { }

    getAllUsers(page: number = 1, limit: number = 20): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this.http.get(this.baseUrl, { params });
    }

    getUser(id: string): Observable<IUser> {
        return this.http.get<IUser>(`${this.baseUrl}/${id}`);
    }

    createUser(user: Partial<IUser>): Observable<IUser> {
        return this.http.post<IUser>(this.baseUrl, user);
    }

    updateUser(id: string, user: Partial<IUser>): Observable<IUser> {
        return this.http.put<IUser>(`${this.baseUrl}/${id}`, user);
    }

    updateUserName(id: string, userName: string): Observable<IOTPVerificationResponse> {
        return this.http.patch<IOTPVerificationResponse>(`${this.baseUrl}/updateName`, { userName });
    }

    deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    searchUsers(searchText: string, page: number = 1, limit: number = 20): Observable<IPagedResponse<IUser>> {
        return this.http.get<IPagedResponse<IUser>>(`${this.baseUrl}/search/${searchText}`, {
            params: new HttpParams()
                .set('page', page.toString())
                .set('limit', limit.toString())
        });
    }

    updateMyUserName(userName: string): Observable<IOTPVerificationResponse> {
        return this.http.patch<IOTPVerificationResponse>(`${this.baseUrl}/updateName`, { userName });
    }
}