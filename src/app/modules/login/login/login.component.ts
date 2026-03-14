import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil, tap } from 'rxjs';
import { LoginService } from '../../../services/login.service';
import { FcmTokenService } from '../../../services/fcm-token.service';
import { UserService } from '../../../services/user.service';
import { SocietyRoles } from '../../../types';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WindowService } from '../../../services/window.service';

interface IFeatures {
  iconName: string;
  iconClass?: string;
  bgColorClass: string;
  textColorClass: string;
  title: string;
  description: string;
  svgPath: string;
  isSpecial?: boolean;
}

interface IJoinAsRole {
  role: string; label: string; icon: string
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  otpForm: FormGroup;
  step: 'login' | 'otp' = 'login';
  isLoading = false;
  isVerifying = false;
  isComponentActive = new Subject<void>();

  features: IFeatures[] = [
    {
      iconName: 'building2',
      bgColorClass: 'bg-blue-100',
      textColorClass: 'text-blue-600',
      title: 'Societies',
      description: 'Manage multiple residential societies from a single unified dashboard view.',
      svgPath: 'M10 12h4 M10 8h4 M14 21v-3a2 2 0 0 0-4 0v3 M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2 M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16'
    },
    {
      iconName: 'house',
      bgColorClass: 'bg-indigo-100',
      textColorClass: 'text-indigo-600',
      title: 'Buildings',
      description: 'Organize large complexes by tracking specific buildings, wings, and blocks.',
      svgPath: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8 M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'
    },
    {
      iconName: 'door-open',
      bgColorClass: 'bg-purple-100',
      textColorClass: 'text-purple-600',
      title: 'Flats',
      description: 'Maintain detailed records of flats, their current occupancy status, and ownership.',
      svgPath: 'M11 20H2 M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z M11 4H8a2 2 0 0 0-2 2v14 M14 12h.01 M22 20h-3'
    },
    {
      iconName: 'log-out',
      bgColorClass: 'bg-rose-100',
      textColorClass: 'text-rose-600',
      title: 'Gate Entry',
      description: 'Real-time logging and monitoring of all inbound and outbound gate activities.',
      svgPath: 'm16 17 5-5-5-5 M21 12H9 M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'
    },
    {
      iconName: 'ticket',
      bgColorClass: 'bg-orange-100',
      textColorClass: 'text-orange-600',
      title: 'Gate Pass',
      description: 'Generate secure digital gate passes for expected guests and service staff.',
      svgPath: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z M13 5v2 M13 17v2 M13 11v2'
    },
    {
      iconName: 'message-square-warning',
      bgColorClass: 'bg-amber-100',
      textColorClass: 'text-amber-600',
      title: 'Complaints',
      description: 'Digital ticketing system for residents to submit and track maintenance requests.',
      svgPath: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z M12 15h.01 M12 7v4'
    },
    {
      iconName: 'users',
      bgColorClass: 'bg-emerald-100',
      textColorClass: 'text-emerald-600',
      title: 'Members',
      description: 'Comprehensive directory of society committee members and flat owners.',
      svgPath: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M16 3.128a4 4 0 0 1 0 7.744 M22 21v-2a4 4 0 0 0-3-3.87 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0'
    },
    {
      iconName: 'user-check',
      bgColorClass: 'bg-teal-100',
      textColorClass: 'text-teal-600',
      title: 'Tenants',
      description: 'Track tenant information, lease durations, and move-in/move-out details.',
      svgPath: 'm16 11 2 2 4-4 M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0'
    },
    {
      iconName: 'user-plus',
      bgColorClass: 'bg-cyan-100',
      textColorClass: 'text-cyan-600',
      title: 'Visitors',
      description: 'Digital logbook replacing paper registers for better security and accountability.',
      svgPath: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M19 8v6 M22 11h-6'
    },
    {
      iconName: 'megaphone',
      bgColorClass: 'bg-sky-100',
      textColorClass: 'text-sky-600',
      title: 'Announcements',
      description: 'Instantly broadcast important notices and alerts to all registered residents.',
      svgPath: 'M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14 M8 6v8'
    },
    {
      iconName: 'car',
      bgColorClass: 'bg-slate-100',
      textColorClass: 'text-slate-600',
      title: 'Vehicles',
      description: 'Register resident vehicles and manage parking spot allocations securely.',
      svgPath: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2 M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M9 17h6 M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0'
    }
  ];
  roles: IJoinAsRole[] = [
    {
      role: SocietyRoles.owner,
      label: 'Flat Owner',
      icon: 'home'
    },
    {
      role: SocietyRoles.tenant,
      label: 'Tenant',
      icon: 'tenant'
    },
    {
      role: SocietyRoles.security,
      label: 'Security',
      icon: 'security'
    }
  ]

  @ViewChild('loginPopup') loginPopup!: TemplateRef<any>;
  loginPopupDialogRef: MatDialogRef<any> | null = null;

  countDownTimer = 300;
  countdown = this.countDownTimer;
  countdownInterval: any;


  otpError = false;

  get enableShoeMoreFeature(): boolean {
    return this.windowService.mode.value === 'mobile'
  }


  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private userService: UserService,
    private fcmTokenService: FcmTokenService,
    private dialog: MatDialog,
    private windowService: WindowService
  ) {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });


    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    });
  }

  ngOnInit(): void {
    this.subscribeToOTPNotification();
  }

  subscribeToOTPNotification() {
    this.loginService.otpReceived
      .pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: otp => {
          if (!otp || otp.length === 0) return;

          this.otpForm.get('otp')?.setValue(otp);
          this.verifyOtp();
        }
      });
  }


  openLoginPopup() {
    this.loginPopupDialogRef = this.dialog.open(this.loginPopup)
    return this.loginPopupDialogRef
      .afterClosed()
      .pipe(
        take(1),
        tap(() => {
          this.resetToLogin();
        })
      )
  }

  closeLoginPopup() {
    this.loginPopupDialogRef?.close();
  }

  simpleLogin() {
    this.openLoginPopup()
      .subscribe(token => {
        if (token) {
          this.loginService.saveTokenToStorage(token);
          this.getAndSaveProfile();
        }
      })
  }

  sendOtp() {
    if (this.loginForm.invalid) return;


    this.isLoading = true;
    const fcmToken = this.fcmTokenService.fcmToken;
    this.loginService.sendOTP(this.loginForm.value.phone, fcmToken)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.step = 'otp';
          this.startCountdown();
        },
        error: err => {
          this.isLoading = false;
        }
      });
  }


  startCountdown() {
    this.countdown = this.countDownTimer;
    clearInterval(this.countdownInterval);


    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }


  resendOtp() {
    if (this.countdown > 0) return;


    this.sendOtp();
  }


  verifyOtp() {
    if (this.otpForm.invalid) return;


    this.isVerifying = true;
    this.otpError = false;


    this.loginService.verifyOTP(this.loginForm.value.phone, this.otpForm.value.otp)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.isVerifying = false;


          if (!response.success) {
            this.otpError = true;
            return;
          }

          if (response?.token) {
            this.loginPopupDialogRef?.close(response.token);
          }

        },
        error: err => {
          this.isVerifying = false;
          this.otpError = true;
        }
      });
  }

  getAndSaveProfile() {
    this.isVerifying = true;

    // this.router.navigateByUrl('/dashboard');
    this.loginService.loadProfile()
      .pipe(take(1))
      .subscribe((response: any) => {
        this.isVerifying = false;

        if (!response || !response.success) {
          this.otpError = true;
          return;
        }

        const fcmToken = this.fcmTokenService.fcmToken;
        if (!fcmToken) return;
      })
  }


  resetToLogin() {
    this.step = 'login';
    this.otpError = false;
    this.isLoading = false;
    this.isVerifying = false;
    this.otpForm.get('otp')?.setValue('');
    clearInterval(this.countdownInterval);
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
