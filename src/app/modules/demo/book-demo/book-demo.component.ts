import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DemoService } from '../../../services/demo.service';
import { LoginService } from '../../../services/login.service';
import { finalize } from 'rxjs/operators';
import { ITimeSlotAvailability, IDemoBooking, IBEResponseFormat } from '../../../interfaces';
import { BookingSource } from '../../../constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-demo',
  templateUrl: './book-demo.component.html',
  styleUrls: ['./book-demo.component.scss']
})
export class BookDemoComponent implements OnInit {
  private _snackBar = inject(MatSnackBar);
  private router = inject(Router);

  demoForm!: FormGroup;
  selectedTime: string | null = null;
  isSubmitting = false;
  minDate: string;
  submitSuccess = false;
  submitError: string | null = null;
  bookingReference: string | null = null;

  // Slot availability
  slotAvailability: ITimeSlotAvailability | null = null;
  isLoadingSlots = false;
  unavailableSlots: Set<string> = new Set();

  // Available time slots - matching your backend enum
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

    // Watch for date changes to check availability
    this.demoForm.get('preferredDate')?.valueChanges.subscribe(date => {
      if (date) {
        this.loadSlotAvailability(date);
      } else {
        this.slotAvailability = null;
        this.unavailableSlots.clear();
      }
    });
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

  // Load slot availability for selected date
  loadSlotAvailability(date: string): void {
    this.isLoadingSlots = true;
    this.unavailableSlots.clear();

    this.demoService.checkSlotAvailability(date).subscribe({
      next: (response) => {
        this.isLoadingSlots = false;
        if (response.success && response.data) {
          this.slotAvailability = response.data;

          // Track unavailable slots
          response.data.slots.forEach(slot => {
            if (!slot.available) {
              this.unavailableSlots.add(slot.time);
            }
          });

          // Clear selected time if it's now unavailable
          if (this.selectedTime && this.unavailableSlots.has(this.selectedTime)) {
            this.selectedTime = null;
          }
        }
      },
      error: (error) => {
        this.isLoadingSlots = false;
        console.error('Failed to load slot availability:', error);
        // Don't block booking if availability check fails
      }
    });
  }

  // Check if field is invalid and touched
  isFieldInvalid(fieldName: string): boolean {
    const field = this.demoForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  // Check if time slot is available
  isTimeSlotAvailable(time: string): boolean {
    return !this.unavailableSlots.has(time);
  }

  // Get slot status message
  getSlotStatusMessage(time: string): string {
    if (this.isLoadingSlots) {
      return 'Checking availability...';
    }
    if (this.unavailableSlots.has(time)) {
      return 'Fully booked';
    }
    return 'Available';
  }

  // Select time slot
  selectTimeSlot(time: string): void {
    if (this.unavailableSlots.has(time)) {
      return; // Don't allow selecting unavailable slots
    }
    this.selectedTime = this.selectedTime === time ? null : time;
  }

  // Prepare booking data matching IDemoBooking interface
  private prepareBookingData(): Partial<IDemoBooking> {
    const formValue = this.demoForm.value;

    return {
      fullName: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone,
      societyName: formValue.societyName || undefined,
      preferredDate: formValue.preferredDate,
      preferredTime: this.selectedTime!,
      notes: formValue.notes || undefined,
      source: BookingSource.WEBSITE, // Default source
      bookingDate: new Date()
    };
  }

  // Reset form after successful submission
  private resetForm(): void {
    this.demoForm.reset();
    this.selectedTime = null;
    this.submitSuccess = false;
    this.bookingReference = null;
    this.slotAvailability = null;
    this.unavailableSlots.clear();

    // Mark as pristine and untouched
    Object.keys(this.demoForm.controls).forEach(key => {
      const control = this.demoForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
    });
  }

  // Handle successful booking
  private handleSuccess(response: IBEResponseFormat<IDemoBooking>): void {
    this.isSubmitting = false;
    this.submitSuccess = true;
    this.submitError = null;

    // if (response.data?.bookingReference) {
    //   this.bookingReference = response.data.bookingReference;
    // }
    this.router.navigateByUrl('');

    this._snackBar.open('Sent Demo Request to Admin.', undefined, { duration: 1000 })


  }

  // Handle booking error
  private handleError(error: any): void {
    this.isSubmitting = false;
    this.submitSuccess = false;

    if (error.error && error.error.message) {
      this.submitError = error.error.message;
    } else if (error.message) {
      this.submitError = error.message;
    } else {
      this.submitError = 'Failed to book demo. Please try again.';
    }

    console.error('Booking failed:', this.submitError);
  }

  // Form submission
  onSubmit(): void {
    // Mark all fields as touched to trigger validation messages
    if (this.demoForm.invalid) {
      Object.keys(this.demoForm.controls).forEach(key => {
        const control = this.demoForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    if (!this.selectedTime) {
      // Mark preferredTime as invalid
      this.demoForm.setErrors({ noTimeSelected: true });
      return;
    }

    // Check if selected time is still available
    if (this.unavailableSlots.has(this.selectedTime)) {
      this.submitError = 'Selected time slot is no longer available. Please choose another time.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    const bookingData = this.prepareBookingData();

    this.demoService.bookDemo(bookingData)
      .pipe(finalize(() => {
        // Any cleanup if needed
      }))
      .subscribe({
        next: (response) => this.handleSuccess(response),
        error: (error) => this.handleError(error)
      });
  }

  // Get booking reference for display
  getBookingReferenceMessage(): string {
    return this.bookingReference
      ? `Your booking reference: ${this.bookingReference}`
      : '';
  }

  // Format date for display
  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Check if date is fully booked
  isDateFullyBooked(): boolean {
    if (!this.slotAvailability) return false;
    return this.slotAvailability.slots.every(slot => !slot.available);
  }
}