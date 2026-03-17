import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IMyProfile, IPricingPlan, ISociety, ISocietyPlan } from '../../../interfaces';
import { PricingPlanService } from '../../../services/pricing-plan.service';
import { SocietyService } from '../../../services/society.service';
import { LoginService } from '../../../services/login.service';
import { Location } from '@angular/common';
import { take } from 'rxjs';

@Component({
  selector: 'app-pricing-checkout',
  templateUrl: './pricing-checkout.component.html',
  styleUrls: ['./pricing-checkout.component.scss']
})
export class PricingCheckoutComponent implements OnInit {
  currentStep: number = 1;
  societyId: string = '';
  societyDetails?: ISociety;
  selectedPlan?: IPricingPlan;
  couponCode: string = '';
  couponMessage: string = '';
  isCouponApplied: boolean = false;
  totalPrice: number = 0;
  originalPrice: number = 0;
  isProcessing: boolean = false;
  purchaseComplete: boolean = false;
  societyPlan: ISocietyPlan | null = null;
  myProfile?: IMyProfile;
  showSocietySelectModal = false;

  // Payment methods
  paymentMethods = [
    { id: 'upi', name: 'UPI', disabled: false },
    { id: 'card', name: 'Credit/Debit Card', disabled: true },
    { id: 'netbanking', name: 'Net Banking', disabled: true },
    { id: 'wallet', name: 'Wallet', disabled: true }
  ];

  selectedPaymentMethod: string = 'upi';

  // Form groups
  couponForm: FormGroup;
  upiForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public loginService: LoginService,
    private pricingPlanService: PricingPlanService,
    private societyService: SocietyService,
    private location: Location,
  ) {
    this.couponForm = this.fb.group({
      couponCode: ['']
    });

    this.upiForm = this.fb.group({
      upiId: ['', [Validators.required, Validators.pattern(/^[\w\.\-_]{2,}@[a-zA-Z]{2,}$/)]]
    });
  }

  ngOnInit(): void {
    // Get My Profile
    this.myProfile = this.loginService.getProfileFromStorage();
    // Get societyId and plan from route/state
    this.route.params.subscribe(params => {
      console.log('params = ', params)
      this.societyId = params['societyId'];
      if (this.societyId) {
        this.societyService.getSociety(this.societyId).subscribe({
          next: (society) => {
            this.societyDetails = society;
          },
          error: (error) => {
            console.error('Error fetching society:', error);
          }
        });
      }

      this.selectedPlan = this.pricingPlanService.plans.find(p => p._id === params['planId']);
      if (this.selectedPlan) this.calculatePrice();
      else this.router.navigate(['/']);
    });
  }

  calculatePrice(): void {
    if (!this.selectedPlan) return;

    // Parse price - handle 'Free' case
    if (this.selectedPlan.price === 'Free') {
      this.originalPrice = 0;
      this.totalPrice = 0;
      return;
    }

    // Convert price string to number
    this.originalPrice = parseInt(this.selectedPlan.price) * 12; // Yearly price
    this.totalPrice = this.originalPrice;
  }

  applyCoupon(): void {
    this.couponCode = this.couponForm.get('couponCode')?.value;

    if (!this.couponCode) {
      this.couponMessage = 'Please enter a coupon code';
      return;
    }

    // Check for SKFREE coupon
    if (this.couponCode.toUpperCase() === 'SKFREE') {
      this.totalPrice = 0;
      this.isCouponApplied = true;
      this.couponMessage = 'Coupon applied successfully!';
    } else {
      this.couponMessage = 'Coupon not found';
      this.isCouponApplied = false;
    }
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      // Step 1 validation
      if (this.totalPrice === 0) {
        // Complete purchase directly
        this.completePurchase();
      } else {
        this.currentStep = 2;
      }
    } else if (this.currentStep === 2) {
      // Step 2 validation
      if (this.selectedPaymentMethod === 'upi') {
        this.currentStep = 3;
      }
    } else if (this.currentStep === 3) {
      // Step 3 validation
      if (this.upiForm.valid) {
        this.completePurchase();
      } else {
        this.upiForm.markAllAsTouched();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  async completePurchase() {
    try {
      this.myProfile = this.loginService.getProfileFromStorage();
      if (!this.myProfile) {
        await this.getLoggedIn();
      }
      if (!this.societyId) {
        this.getSociety();
      }
      if (!this.selectedPlan || !this.societyId) return;

      this.isProcessing = true;

      this.pricingPlanService.purchasePlan(
        this.societyId,
        this.selectedPlan._id,
        'yearly' // Always yearly as per your requirement
      ).subscribe({
        next: (plan) => {
          this.societyPlan = plan;
          this.purchaseComplete = true;
          this.isProcessing = false;
          // Optionally redirect to success page
        },
        error: (error) => {
          console.error('Purchase failed:', error);
          this.isProcessing = false;
          // Show error message
        }
      });

    } catch (err) {
      console.log('Error ', err);
    }
  }

  selectPaymentMethod(methodId: string): void {
    const method = this.paymentMethods.find(m => m.id === methodId);
    if (method && !method.disabled) {
      this.selectedPaymentMethod = methodId;
    }
  }

  // Helper to check if current step is valid
  isStepValid(): boolean {
    if (this.currentStep === 1) {
      return true; // No validation needed for step 1
    } else if (this.currentStep === 2) {
      return this.selectedPaymentMethod === 'upi'; // Only UPI enabled
    } else if (this.currentStep === 3) {
      return this.upiForm.valid;
    }
    return false;
  }

  // Get step status for stepper
  getStepStatus(step: number): 'active' | 'completed' | 'pending' {
    if (this.currentStep === step) return 'active';
    if (step < this.currentStep) return 'completed';
    return 'pending';
  }

  changePlan() {
    this.router.navigateByUrl('/pricing-plan/list')
  }

  getLoggedIn() {
    return new Promise((resolve, reject) => {
      this.loginService.loginAndReturn()
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            console.log('my profile = ', this.myProfile)
            resolve(response)
          },
          error: err => reject(err)
        })
    });
  }

  getSociety() {
    this.showSocietySelectModal = true;
  }

  closeModal() {
    this.showSocietySelectModal = false;
  }

  cancel() {
    this.location.back();
  }
}