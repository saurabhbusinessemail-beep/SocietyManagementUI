import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { delay, of } from 'rxjs';

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


  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });


    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    });
  }


  // Fake send OTP
  sendOtp() {
    if (this.loginForm.invalid) return;


    this.isLoading = true;
    of(true).pipe(delay(1500)).subscribe(() => {
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


    // Fake API call
    of(false).pipe(delay(1200)).subscribe((success) => {
      this.isVerifying = false;


      if (!success) {
        this.otpError = true;
        return;
      }


      alert('Login successful!');
    });
  }


  resetToLogin() {
    this.step = 'login';
    this.otpError = false;
    clearInterval(this.countdownInterval);
  }
}
