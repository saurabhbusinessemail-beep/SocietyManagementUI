import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, take, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { MenuService } from './menu.service';
import { IBEResponseFormat, IMyProfile, IMyProfileResponse, IOTPVerificationResponse } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    private baseUrl = `${environment.apiBaseUrl}/auth`;

    constructor(private http: HttpClient, private router: Router, private menuService: MenuService) {
        this.loadProfile().pipe(take(1)).subscribe();
    }

    // --------------------------------------------------------
    // STEP 1: SEND OTP
    // --------------------------------------------------------
    sendOTP(phoneNumber: string): Observable<IBEResponseFormat> {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/request-otp`, { phoneNumber });
    }

    // --------------------------------------------------------
    // STEP 2: VERIFY OTP + RECEIVE TOKEN
    // --------------------------------------------------------
    verifyOTP(phoneNumber: string, otp: string): Observable<IOTPVerificationResponse> {
        return this.http.post<IOTPVerificationResponse>(`${this.baseUrl}/verify-otp`, { phoneNumber, otp })
    }

    // --------------------------------------------------------
    // GET LOGGED-IN USER INFO
    // --------------------------------------------------------
    getProfile(): Observable<IMyProfileResponse | null> {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            this.logout();
            return of<null>();
        }

        const headers = new HttpHeaders({
            Authorization: token || ''
        });

        return this.http.get<IMyProfileResponse>(`${this.baseUrl}/me`, { headers })
            .pipe(tap(response => {
                if (response && response.success && response.profile.allMenus) {
                    this.menuService.userMenus.next(response.profile.allMenus);
                }
            }));
    }



    loadProfile() {
        return new Observable<IMyProfileResponse | null>(observer => {
            this.getProfile()
                .pipe(take(1))
                .subscribe({
                    next: response => {
                        console.log('menu = ', this.menuService.userMenus.value)
                        if (!response || !response.success) {
                            observer.next(null);
                            observer.complete();
                            return;
                        }

                        this.saveProfileToStorage(response.profile);
                        observer.next(response);
                        observer.complete();

                    }
                })
        })

    }

    // --------------------------------------------------------
    // LOGOUT
    // --------------------------------------------------------
    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('my_profile');
        this.router.navigateByUrl('/login');
    }

    // --------------------------------------------------------
    // CHECK LOGIN STATUS
    // --------------------------------------------------------
    isLoggedIn(): boolean {
        return !!localStorage.getItem('auth_token');
    }

    saveTokenToStorage(token: string) {
        localStorage.setItem('auth_token', token);
    }

    saveProfileToStorage(profile: IMyProfile) {
        localStorage.setItem('my_profile', JSON.stringify(profile));
    }
}
