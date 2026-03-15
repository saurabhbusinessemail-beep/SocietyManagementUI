import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DemoService } from '../../../services/demo.service';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-book-demo',
  templateUrl: './book-demo.component.html',
  styleUrls: ['./book-demo.component.scss']
})
export class BookDemoComponent implements OnInit {
  demoForm!: FormGroup;
  selectedTime: string | null = null;
  isSubmitting = false;
  minDate: string;

  // Available time slots
  timeSlots: string[] = [
    '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM',
    '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  constructor(
    private fb: FormBuilder,
    private demoService: DemoService,
    public loginService: LoginService
  ) {
    // Set minimum date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.demoForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)]],
      societyName: [''],
      preferredDate: ['', [Validators.required, this.futureDateValidator]],
      notes: ['']
    });
  }

  // Custom validator for future date
  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate >= today ? null : { futureDate: true };
  }

  // Check if field is invalid and touched
  isFieldInvalid(fieldName: string): boolean {
    const field = this.demoForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  // Select time slot
  selectTimeSlot(time: string): void {
    this.selectedTime = this.selectedTime === time ? null : time;
  }

  // Form submission
  onSubmit(): void {
    if (this.demoForm.invalid || !this.selectedTime) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.demoForm.controls).forEach(key => {
        const control = this.demoForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const bookingData = {
      ...this.demoForm.value,
      preferredTime: this.selectedTime,
      bookingDate: new Date().toISOString()
    };

    this.demoService.bookDemo(bookingData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        // Handle success - show toast, navigate, etc.
        console.log('Booking successful', response);
        // You can add a success message service here
      },
      error: (error) => {
        this.isSubmitting = false;
        // Handle error - show toast, etc.
        console.error('Booking failed', error);
        // You can add an error message service here
      }
    });
  }
}