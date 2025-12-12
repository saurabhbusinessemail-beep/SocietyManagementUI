import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  otpForm: FormGroup;
  step: 'login' | 'otp' = 'login';
  isLoading = false;
  isVerifying = false;


  countDownTimer = 300;
  countdown = this.countDownTimer;
  countdownInterval: any;


  otpError = false;


  constructor(private fb: FormBuilder, private loginService: LoginService) {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });


    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    });
  }


  sendOtp() {
    if (this.loginForm.invalid) return;


    this.isLoading = true;
    this.loginService.sendOTP(this.loginForm.value.phone)
      .pipe(take(1))
      .subscribe(() => {
        this.isLoading = false;
        this.step = 'otp';
        this.startCountdown();
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
      .subscribe((response) => {
        this.isVerifying = false;


        if (!response.success) {
          this.otpError = true;
          return;
        }

        if (response?.token) {
          this.loginService.saveTokenToStorage(response.token);
          this.getAndSaveProfile();
        }

      });
  }

  getAndSaveProfile() {
    this.isVerifying = true;

    this.loginService.getProfile()
      .pipe(take(1))
      .subscribe(response => {
        this.isVerifying = false;


        if (!response.success) {
          this.otpError = true;
          return;
        }

        if (response?.user) {
          this.loginService.saveProfileToStorage(response.user);
        }

      })
  }


  resetToLogin() {
    this.step = 'login';
    this.otpError = false;
    this.isLoading = false;
    this.isVerifying = false;
    clearInterval(this.countdownInterval);
  }
}
