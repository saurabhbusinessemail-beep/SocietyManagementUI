import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IChangePlanCalculation, IMyProfile, IPricingPlan, ISociety, ISocietyPlan } from '../../../interfaces';
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
  paramHasSocietyId = false;
  societyDetails?: ISociety;
  selectedPlan?: IPricingPlan;
  couponCode: string = '';
  couponMessage: string = '';
  isCouponApplied: boolean = false;
  totalPrice: number = 0;
  originalPrice: number = 0;
  discountAmount: number = 0;
  discountPercentage: number = 0;
  isProcessing: boolean = false;
  purchaseComplete: boolean = false;
  societyPlan: ISocietyPlan | null = null;
  myProfile?: IMyProfile;
  showSocietySelectModal = false;
  tentativeTotalPrice: number = 0;

  // Change plan related properties
  isChangePlan = false;
  currentPlanDetails?: any;
  changePlanCalculation?: IChangePlanCalculation;
  showChangePlanSummary = false;
  showRemoveCoupon: boolean = false;

  // Payment methods
  paymentMethods = [
    { id: 'upi', name: 'UPI', disabled: false },
    { id: 'card', name: 'Credit/Debit Card', disabled: true },
    { id: 'netbanking', name: 'Net Banking', disabled: true },
    { id: 'wallet', name: 'Wallet', disabled: true }
  ];

  selectedPaymentMethod: string = 'upi';
  societyLoading = false;

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
      this.societyId = params['societyId'];
      if (this.societyId) {
        this.paramHasSocietyId = true;
        this.loadSociety(this.societyId);

        // Check if this is a change plan by looking for current plan
        this.checkForCurrentPlan();
      }

      this.selectedPlan = this.pricingPlanService.plans.find(p => p.id === params['planId']);
      if (this.selectedPlan) this.calculatePrice();
      else this.router.navigate(['/']);
    });
  }

  checkForCurrentPlan(): void {
    this.pricingPlanService.getCurrentPlan(this.societyId).subscribe({
      next: response => {
        if (response) {
          this.currentPlanDetails = response;

          // Check if current plan is Basic/Free
          const isCurrentPlanFree = this.currentPlanDetails.price === 'Free' ||
            this.currentPlanDetails.planName === 'Basic';

          // If current plan is not free, this is a change plan
          if (!isCurrentPlanFree) {
            this.isChangePlan = true;
            this.calculateChangePrice();
          }
        }
      },
      error: (err) => {
        // No current plan found - this is a new purchase
        console.log('No current plan found - new purchase');
      }
    });
  }

  calculateChangePrice(couponCode?: string): void {
    if (!this.selectedPlan || !this.societyId) return;

    this.pricingPlanService.calculateChangePrice(this.societyId, this.selectedPlan.id, couponCode).subscribe({
      next: response => {
        this.changePlanCalculation = response;
        this.totalPrice = this.changePlanCalculation?.calculation?.finalAmount ?? 0;
        this.originalPrice = this.changePlanCalculation?.calculation?.amountToPay ?? 0;
        this.discountAmount = this.changePlanCalculation?.calculation?.discount ?? 0;
        this.discountPercentage = this.originalPrice > 0 ? (this.discountAmount / this.originalPrice) * 100 : 0;
        this.showChangePlanSummary = true;
      },
      error: (err) => {
        console.error('Error calculating change price:', err);
        this.couponMessage = err.error?.message || 'Error applying coupon';
      }
    });
  }

  triggerLogin() {
    this.loginService.loginAndReturn()
      .pipe(take(1))
      .subscribe({
        next: response => {
          setTimeout(() => {
            this.myProfile = this.loginService.getProfileFromStorage();
          }, 300);
        }
      })
  }

  loadSociety(societyId: string) {
    this.societyLoading = true;
    this.societyService.getSociety(this.societyId).subscribe({
      next: (society) => {
        this.societyDetails = society;
        this.societyLoading = false;
        this.calculatePrice();

        // After society loads, check for current plan again
        this.checkForCurrentPlan();
      },
      error: (error) => {
        this.societyLoading = false;
        console.error('Error fetching society:', error);
      }
    });
  }

  calculatePrice(): void {
    if (!this.selectedPlan) return;

    // Parse price - handle 'Free' case
    if (this.selectedPlan.price === 'Free') {
      this.originalPrice = 0;
      this.totalPrice = 0;
      this.tentativeTotalPrice = 0;
      return;
    }

    // Convert price string to number
    const pricePerFlat = parseInt(this.selectedPlan.price);

    if (this.societyDetails?.numberOfFlats) {
      // Actual price with known flats
      this.originalPrice = pricePerFlat * this.societyDetails.numberOfFlats * 12;
      this.tentativeTotalPrice = this.originalPrice;
    } else {
      // Tentative price - assume at least 10 flats for estimation
      this.originalPrice = pricePerFlat * 10 * 12;
      this.tentativeTotalPrice = this.originalPrice;
    }

    this.totalPrice = this.originalPrice;
  }

  applyCoupon(): void {
    this.couponCode = this.couponForm.get('couponCode')?.value;

    if (!this.couponCode) {
      this.couponMessage = 'Please enter a coupon code';
      return;
    }

    // Determine amount to apply coupon on
    let amountToDiscount = this.isChangePlan && this.changePlanCalculation
      ? (this.changePlanCalculation.calculation?.amountToPay ?? 0)
      : (this.societyDetails ? this.originalPrice : this.tentativeTotalPrice);

    this.pricingPlanService.validateCoupon(this.couponCode, amountToDiscount).subscribe({
      next: (response) => {
        if (response.valid) {
          if (this.isChangePlan) {
            // Recalculate change price with coupon
            this.calculateChangePrice(this.couponCode);
          } else {
            // Update new purchase price
            this.discountAmount = response.discount;
            this.totalPrice = response.finalAmount;
            this.discountPercentage = this.originalPrice > 0 ? (this.discountAmount / this.originalPrice) * 100 : 0;
          }
          this.isCouponApplied = true;
          this.showRemoveCoupon = true;
          this.couponForm.get('couponCode')?.disable();
          this.couponMessage = 'Coupon applied successfully!';
        } else {
          this.couponMessage = response.message || 'Coupon not found';
          this.isCouponApplied = false;
          this.showRemoveCoupon = false;
          this.discountAmount = 0;
          this.discountPercentage = 0;
        }
      },
      error: (err) => {
        this.couponMessage = err.error?.message || 'Error applying coupon';
        this.isCouponApplied = false;
        this.showRemoveCoupon = false;
        this.discountAmount = 0;
        this.discountPercentage = 0;
      }
    });
  }

  removeCoupon(): void {
    this.isCouponApplied = false;
    this.showRemoveCoupon = false;
    this.couponForm.get('couponCode')?.enable();
    this.couponForm.get('couponCode')?.setValue('');
    this.couponMessage = '';
    this.discountAmount = 0;
    this.discountPercentage = 0;

    if (this.isChangePlan) {
      // Recalculate without coupon
      this.calculateChangePrice();
    } else {
      // Reset to original price
      this.totalPrice = this.originalPrice;
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

      if (this.isChangePlan && this.changePlanCalculation) {
        // Use change plan API with coupon if applied
        this.pricingPlanService.changePlan(
          this.societyId,
          this.selectedPlan.id,
          'yearly',
          this.selectedPaymentMethod,
          { upiId: this.upiForm.get('upiId')?.value },
          this.isCouponApplied ? this.couponCode : undefined
        ).subscribe({
          next: (plan) => {
            this.societyPlan = plan;
            this.purchaseComplete = true;
            this.isProcessing = false;
          },
          error: (error) => {
            console.error('Change plan failed:', error);
            this.isProcessing = false;
          }
        });
      } else {
        // Use new purchase API with coupon if applied
        this.pricingPlanService.purchasePlan(
          this.societyId,
          this.selectedPlan.id,
          'yearly',
          this.isCouponApplied ? this.couponCode : undefined
        ).subscribe({
          next: (plan) => {
            this.societyPlan = plan;
            this.purchaseComplete = true;
            this.isProcessing = false;
          },
          error: (error) => {
            console.error('Purchase failed:', error);
            this.isProcessing = false;
          }
        });
      }

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

  onSocietySelected(society: ISociety): void {
    this.societyId = society._id;
    this.calculatePrice();
  }

  confirmSelectedSociety() {
    if (!this.societyId) return;

    this.showSocietySelectModal = false;
    this.loadSociety(this.societyId);
  }

  // Helper to check if current step is valid
  isStepValid(): boolean {
    // Disable next button if society details not loaded
    if (!this.societyDetails && this.currentStep === 1) {
      return false;
    }

    if (this.currentStep === 1) {
      return true; // Society details are loaded
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
    this.router.navigate(['pricing-plan/list', this.societyId])
  }

  getLoggedIn() {
    return new Promise((resolve, reject) => {
      this.loginService.loginAndReturn()
        .pipe(take(1))
        .subscribe({
          next: (response) => {
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
    if (this.societyId && this.paramHasSocietyId) {
      this.router.navigate(['society', this.societyId, 'details'])
      return;
    }
    this.location.back();
  }
}