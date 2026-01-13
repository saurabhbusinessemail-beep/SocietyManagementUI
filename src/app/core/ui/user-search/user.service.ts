import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IOTPVerificationResponse, IPagedResponse, IUser } from '../../../interfaces';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private baseUrl = `${environment.apiBaseUrl}/users`;

    constructor(private http: HttpClient) { }

    searchUsers(searchString: string): Observable<IPagedResponse<IUser>> {
        return this.http.get<IPagedResponse<IUser>>(`${this.baseUrl}/search/${searchString}`);
    }

    updateUserName(userName: string): Observable<IOTPVerificationResponse> {
        return this.http.patch<IOTPVerificationResponse>(`${this.baseUrl}/updateName`, { userName });
    }

    updateFCMToken(fcmToken: string) {
        return this.http.post<IOTPVerificationResponse>(`${this.baseUrl}/updateFCMToken`, { fcmToken });
    }
}
