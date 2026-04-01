import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil, take } from 'rxjs';
import { FcmTokenService } from '../../services/fcm-token.service';
import { LoginService } from '../../services/login.service';
import { countries } from '../../constants';
import { ICountry, IUIControlConfig, IUIDropdownOption } from '../../interfaces';
import { UserService } from '../../services/user.service';
import { CountryService } from '../../services/country.service';

@Component({
  selector: 'app-login-popup',
  templateUrl: './login-popup.component.html',
  styleUrl: './login-popup.component.scss'
})
export class LoginPopupComponent implements OnInit, OnDestroy {
  @Output() loginSuccess = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

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
  changeCountryNeeded = false;

  countryConfig: IUIControlConfig = {
    id: 'country',
    label: '',
    placeholder: 'Eg: +91 India (IN)'
  }

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private fcmTokenService: FcmTokenService,
    private dialogRef: MatDialogRef<LoginPopupComponent>,
    public countryService: CountryService
  ) {

    this.loginForm = this.fb.group({
      country: this.fb.control<string | undefined>(this.countryService.defaultCountry_Option?.value, Validators.required),
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    });
  }

  ngOnInit(): void {
    this.subscribeToOTPNotification();
  }

  onSearchChange(searchText?: string) {
    const str = searchText?.trim()?.toLowerCase().toString();
    this.countryService.filteredCountryCallingOptions = this.countryService.countryCallingOptions.filter(o => {
      if (!str) return true;
      const result = o.value.toLowerCase().indexOf(str) >= 0 || o.label.toLowerCase().indexOf(str) >= 0;
      return result;
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
    const formValue = this.loginForm.value;
    const phoneNumber = formValue.country + formValue.phone
    this.loginService.sendOTP(phoneNumber, fcmToken)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.step = 'otp';
          this.startCountdown();
          this.countryService.updateDefaultCountryByCallingCode(formValue.country);
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

    const formValue = this.loginForm.value;
    const phoneNumber = formValue.country + formValue.phone;
    this.loginService.verifyOTP(phoneNumber, this.otpForm.value.otp)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.isVerifying = false;

          if (!response.success) {
            this.otpError = true;
            return;
          }

          if (response?.token) {
            this.loginSuccess.emit(response.token);
            this.closePopup();
          }
        },
        error: err => {
          this.isVerifying = false;
          this.otpError = true;
        }
      });
  }

  resetToLogin() {
    this.step = 'login';
    this.otpError = false;
    this.isLoading = false;
    this.isVerifying = false;
    this.otpForm.get('otp')?.setValue('');
    clearInterval(this.countdownInterval);
  }

  closePopup() {
    this.dialogRef?.close();
    this.close.emit();
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
    clearInterval(this.countdownInterval);
  }
}
