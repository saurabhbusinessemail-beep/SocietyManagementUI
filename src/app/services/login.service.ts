import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, map, of, switchMap, take, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { MenuService } from './menu.service';
import { IBEResponseFormat, ICountry, ICurrency, IMyProfile, IMyProfileResponse, IOTPVerificationResponse, IUIDropdownOption } from '../interfaces';
import { ClearCache } from '../decorators';
import { LoginPopupComponent } from '../core/login-popup/login-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { FcmTokenService } from './fcm-token.service';
import { countries } from '../constants';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    private baseUrl = `${environment.apiBaseUrl}/auth`;
    public otpReceived = new Subject<string>();

    private _loggedInUser = new BehaviorSubject<IMyProfile | undefined>(undefined);
    public loggedInUser = this._loggedInUser.asObservable();

    get loggedInUserValue() {
        return this._loggedInUser.value;
    }

    constructor(
        private http: HttpClient,
        private router: Router,
        private menuService: MenuService,
        private dialog: MatDialog,
        private fcmTokenService: FcmTokenService,
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
                    this.menuService.setMenus(response.profile.allMenus);
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
    @ClearCache({ clearAll: true })
    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('my_profile');
        localStorage.removeItem('profilePicture');
        this.menuService.clearMenu();
        this._loggedInUser.next(undefined);
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
        this._loggedInUser.next(profile);
        localStorage.setItem('my_profile', JSON.stringify(profile));
    }

    getProfileFromStorage(): IMyProfile | undefined {
        const profile = localStorage.getItem('my_profile');
        return profile ? JSON.parse(profile) : undefined;
    }


    // Login Popup
    openLoginPopup(): Observable<any> {
        const dialogRef = this.dialog.open(LoginPopupComponent);

        return dialogRef.componentInstance.loginSuccess.pipe(
            take(1),
            tap((token: string) => {
                this.saveTokenToStorage(token);
                dialogRef.close();
            })
        );
    }

    simpleLogin(): void {
        this.openLoginPopup().pipe(
            tap(async () => {
                await this.getAndSaveProfile();
                this.router.navigateByUrl('/dashboard');
            })
        ).subscribe();
    }

    loginAndJoinAs(role: string): void {
        this.openLoginPopup().pipe(
            tap(async () => {
                await this.getAndSaveProfile();
                this.router.navigate(['dashboard/user', role]);
            })
        ).subscribe();
    }

    loginAndReturn() {
        return this.openLoginPopup().pipe(
            map(async () => {
                return await this.getAndSaveProfile();
            })
        )
    }

    getAndSaveProfile() {
        return new Promise((resolve, reject) => {
            this.loadProfile()
                .pipe(take(1))
                .subscribe((response: any) => {
                    if (!response || !response.success) {
                        console.error('Failed to load profile');
                        reject('Failed to load profile');
                        return;
                    }

                    resolve(response);
                });
        });
    }

    sendOtp(phone: string): Observable<any> {
        const fcmToken = this.fcmTokenService.fcmToken;
        return this.sendOTP(phone, fcmToken).pipe(take(1));
    }

    verifyOtp(phone: string, otp: string): Observable<any> {
        return this.verifyOTP(phone, otp).pipe(take(1));
    }

    // Method to handle the complete OTP flow and return token
    loginWithOtp(phone: string, otp: string): Observable<string | null> {
        return this.verifyOtp(phone, otp).pipe(
            take(1),
            tap((response) => {
                if (response?.success && response?.token) {
                    this.saveTokenToStorage(response.token);
                }
            }),
            switchMap((response) => {
                if (response?.success && response?.token) {
                    return this.loadProfile().pipe(
                        take(1),
                        tap(() => {
                            const fcmToken = this.fcmTokenService.fcmToken;
                        }),
                        switchMap(() => [response.token])
                    );
                }
                return [null];
            })
        );
    }
}
