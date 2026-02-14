// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../interfaces/user.interface';
import { environment } from '../../environments/environment';
import { IBEResponseFormat, IOTPVerificationResponse, IPagedResponse } from '../interfaces';
import { Cacheable, InvalidateCache } from '../decorators';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private profilePictureStorageKey = 'profilePicture';
    private baseUrl = `${environment.apiBaseUrl}/users`; // Adjust based on your API URL

    constructor(private http: HttpClient) { }

    saveProfilePictureToStorage(profilePicture: string) {
        localStorage.setItem(this.profilePictureStorageKey, profilePicture);
    }

    getProfilePictureToStorage(): string {
        return localStorage.getItem(this.profilePictureStorageKey) ?? '';
    }

    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1],
        paramKeys: {
            0: ['page'],
            1: ['limit']
        },
        group: 'users'
    })
    getAllUsers(page: number = 1, limit: number = 20): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        return this.http.get(this.baseUrl, { params });
    }

    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0],
        group: 'users'
    })
    getUser(id: string): Observable<IUser> {
        return this.http.get<IUser>(`${this.baseUrl}/${id}`);
    }

    @InvalidateCache({
        methods: [
            'UserService.getAllUsers*',
            'UserService.searchUsers*'
        ],
        groups: ['users']
    })
    createUser(user: Partial<IUser>): Observable<IUser> {
        return this.http.post<IUser>(this.baseUrl, user);
    }

    @InvalidateCache({
        methods: [
            'UserService.getUser',
            'UserService.getAllUsers*',
            'UserService.searchUsers*',
            'UserService.getMyProfilePicture*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['users']
    })
    updateUser(id: string, user: Partial<IUser>): Observable<IUser> {
        return this.http.put<IUser>(`${this.baseUrl}/${id}`, user);
    }

    @InvalidateCache({
        methods: [
            'UserService.getUser',
            'UserService.getAllUsers*',
            'UserService.searchUsers*',
            'UserService.getMyProfilePicture*'
        ],
        groups: ['users']
    })
    updateUserName(id: string, userName: string): Observable<IOTPVerificationResponse> {
        return this.http.patch<IOTPVerificationResponse>(`${this.baseUrl}/updateName`, { userName });
    }

    @InvalidateCache({
        methods: [
            'UserService.getUser',
            'UserService.getAllUsers*',
            'UserService.searchUsers*',
            'UserService.getMyProfilePicture*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['users']
    })
    deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1, 2],
        paramKeys: {
            0: ['searchText'],
            1: ['page'],
            2: ['limit']
        },
        group: 'users'
    })
    searchUsers(searchText: string, page: number = 1, limit: number = 20): Observable<IPagedResponse<IUser>> {
        return this.http.get<IPagedResponse<IUser>>(`${this.baseUrl}/search/${searchText}`, {
            params: new HttpParams()
                .set('page', page.toString())
                .set('limit', limit.toString())
        });
    }

    @InvalidateCache({
        methods: [
            'UserService.getUser',
            'UserService.getAllUsers*',
            'UserService.searchUsers*',
            'UserService.getMyProfilePicture*'
        ],
        groups: ['users']
    })
    updateMyUserName(userName: string): Observable<IOTPVerificationResponse> {
        return this.http.patch<IOTPVerificationResponse>(`${this.baseUrl}/updateName`, { userName });
    }

    @InvalidateCache({
        methods: [
            'UserService.getUser',
            'UserService.getMyProfilePicture*'
        ],
        groups: ['users']
    })
    uploadProfilePicture(profilePicture: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/upload-profile-picture`, { profilePicture });
    }

    @Cacheable({
        // ttl: 300000, // 5 minutes
        group: 'users'
    })
    getMyProfilePicture() {
        return this.http.get<IBEResponseFormat<string>>(`${this.baseUrl}/myProfilePicture`);
    }
}