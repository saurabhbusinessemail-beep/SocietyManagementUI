import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    private baseUrl = `${environment.apiBaseUrl}/auth`;

    constructor(private http: HttpClient) { }

    // --------------------------------------------------------
    // STEP 1: SEND OTP
    // --------------------------------------------------------
    sendOTP(phoneNumber: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/request-otp`, { phoneNumber });
    }

    // --------------------------------------------------------
    // STEP 2: VERIFY OTP + RECEIVE TOKEN
    // --------------------------------------------------------
    verifyOTP(phoneNumber: string, otp: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/verify-otp`, { phoneNumber, otp })
            // .pipe(
            //     tap((res: any) => {
            //         if (res?.token) {
            //             localStorage.setItem('auth_token', res.token);
            //         }
            //     })
            // );
    }

    // --------------------------------------------------------
    // GET LOGGED-IN USER INFO
    // --------------------------------------------------------
    getProfile(): Observable<any> {
        const token = localStorage.getItem('auth_token');

        const headers = new HttpHeaders({
            Authorization: token || ''
        });

        return this.http.get(`${this.baseUrl}/me`, { headers });
    }

    // --------------------------------------------------------
    // LOGOUT
    // --------------------------------------------------------
    logout() {
        localStorage.removeItem('auth_token');
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

    saveProfileToStorage(profile: Object) {
        localStorage.setItem('my_profile', JSON.stringify(profile));
    }
}
