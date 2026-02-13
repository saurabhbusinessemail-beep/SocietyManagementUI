import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { LoginService } from '../../../services/login.service';
import { FcmTokenService } from '../../../services/fcm-token.service';
import { UserService } from '../../../core/ui/user-search/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  otpForm: FormGroup;
  step: 'login' | 'otp' = 'login';
  isLoading = false;
  isVerifying = false;
  isComponentActive = new Subject<void>();


  countDownTimer = 300;
  countdown = this.countDownTimer;
  countdownInterval: any;


  otpError = false;


  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private userService: UserService,
    private fcmTokenService: FcmTokenService
  ) {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });


    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    });
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
            this.loginService.saveTokenToStorage(response.token);
            this.getAndSaveProfile();
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

        this.userService.updateFCMToken(fcmToken)
          .pipe(take(1)).subscribe();
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
