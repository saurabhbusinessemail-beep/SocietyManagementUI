import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, of, take, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from './menu.service';
import { IBEResponseFormat, IMenu, IMyProfile, IMyProfileResponse, IOTPVerificationResponse } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    private baseUrl = `${environment.apiBaseUrl}/auth`;
    public otpReceived = new Subject<string>();

    constructor(
        private http: HttpClient,
        private router: Router,
        private menuService: MenuService,
        private route: ActivatedRoute
    ) {
        this.loadProfile().pipe(take(1)).subscribe();
    }

    // --------------------------------------------------------
    // STEP 1: SEND OTP
    // --------------------------------------------------------
    sendOTP(phoneNumber: string, fcmToken?: string): Observable<IBEResponseFormat> {
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/request-otp`, { phoneNumber, fcmToken });
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
                    const allMenus: IMenu[] = [
                        {
                            _id: '',
                            createdByUserId: '',
                            createdOn: new Date(),
                            menuId: 'dashboard',
                            menuName: 'Dashboard',
                            icon: 'dashboard',
                            relativePath: '/dashboard/user',
                        },
                        ...response.profile.allMenus,
                    ];
                    this.menuService.userMenus.next(allMenus);
                }
            }));
    }

    hasPermission(
        requiredPermission: string,
        spcietyId: string | undefined = undefined
    ): boolean {
        const myProfile = this.getProfileFromStorage();
        if (!myProfile) return false;

        if (myProfile.user.role === 'admin') return true;

        return myProfile.socities.some(s => {
            return (!spcietyId || s.societyId === spcietyId)
                && s.societyRoles.some(sr =>
                    sr.permissions.some(p => p === requiredPermission))
        });
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
        localStorage.removeItem('profilePicture');
        this.router.navigateByUrl('/');
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

    getProfileFromStorage(): IMyProfile | undefined {
        const profile = localStorage.getItem('my_profile');
        return profile ? JSON.parse(profile) : undefined;
    }
}
