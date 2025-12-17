import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IPagedResponse, IUser } from '../../../interfaces';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private baseUrl = `${environment.apiBaseUrl}/users`;

    constructor(private http: HttpClient) { }

    searchUsers(searchString: string): Observable<IPagedResponse<IUser>> {
        return this.http.get<IPagedResponse<IUser>>(`${this.baseUrl}/search/${searchString}`);
    }
}
