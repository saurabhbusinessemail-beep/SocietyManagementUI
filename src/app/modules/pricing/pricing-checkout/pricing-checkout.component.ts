// pricing-checkout.component.ts - Fixed version

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IChangePlanCalculation,
  ICurrentPlanResponse,
  IMyProfile,
  IPricingPlan,
  ISociety,
  ISocietyPlan,
  IDurationPrice,
  IPlanDurationsResponse
} from '../../../interfaces';
import { PricingPlanService } from '../../../services/pricing-plan.service';
import { SocietyService } from '../../../services/society.service';
import { LoginService } from '../../../services/login.service';
import { Location } from '@angular/common';
import { take, takeUntil, finalize, switchMap, map } from 'rxjs/operators';
import { Subject, forkJoin, of, Observable } from 'rxjs';

@Component({
  selector: 'app-pricing-checkout',
  templateUrl: './pricing-checkout.component.html',
  styleUrls: ['./pricing-checkout.component.scss']
})
export class PricingCheckoutComponent implements OnInit, OnDestroy {
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

  // Duration related properties
  selectedDurationValue: number = 0;
  selectedDurationUnit: 'months' | 'years' = 'months';
  availableDurations: IPlanDurationsResponse | null = null;
  isLoadingDurations: boolean = false;
  showDurationSelector: boolean = false;
  isDurationLoaded: boolean = false;

  // Change plan related properties
  isChangePlan = false;
  currentPlanDetails?: ICurrentPlanResponse;
  changePlanCalculation?: IChangePlanCalculation;
  showChangePlanSummary = false;
  showRemoveCoupon: boolean = false;
  isCurrentPlanLoading: boolean = false;

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

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

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
    this.route.params.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.societyId = params['societyId'];
        const planId = params['planId'];

        if (this.societyId) {
          this.paramHasSocietyId = true;
          this.loadSociety(this.societyId);
        }

        // Wait for plans to load before selecting the plan
        return this.waitForPlansToLoad(planId);
      })
    ).subscribe({
      next: (plan) => {
        this.selectedPlan = plan;
        if (this.selectedPlan) {
          this.loadAvailableDurations();
        } else {
          console.error('Plan not found');
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Error loading plan:', error);
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private waitForPlansToLoad(planId: string): Observable<IPricingPlan | undefined> {
    // Check if plans are already loaded
    if (this.pricingPlanService.plans.length > 0) {
      const plan = this.pricingPlanService.plans.find(p => p.id === planId);
      return of(plan);
    }

    // Wait for plans to load
    return this.pricingPlanService.getPlanById(planId).pipe(
      take(1)
    );
  }

  loadAvailableDurations(): void {
    if (!this.selectedPlan) return;

    // Skip duration loading for free plans
    if (this.selectedPlan.price === 'Free') {
      this.showDurationSelector = false;
      this.calculatePrice();
      return;
    }

    this.isLoadingDurations = true;
    this.pricingPlanService.getPlanDurations(this.selectedPlan.id, this.societyId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingDurations = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.availableDurations = response;
          this.showDurationSelector = this.hasDurationOptions();
          this.isDurationLoaded = true;

          // Set default duration only after durations are loaded
          this.setDefaultDuration();

          // Calculate initial price
          this.calculatePrice();

          // Now check for current plan (if society is loaded)
          if (this.societyId && this.societyDetails) {
            this.checkForCurrentPlan();
          }
        },
        error: (error) => {
          console.error('Error loading durations:', error);
          this.showDurationSelector = false;
        }
      });
  }

  setDefaultDuration(): void {
    if (!this.availableDurations) return;

    // Reset duration values
    this.selectedDurationValue = 0;

    // Prefer 1 year if available
    if (this.availableDurations.data.durations.years?.length) {
      const defaultYear = this.availableDurations.data.durations.years.find(y => y.value === 1);
      if (defaultYear) {
        this.selectedDurationValue = 1;
        this.selectedDurationUnit = 'years';
      } else {
        this.selectedDurationValue = this.availableDurations.data.durations.years[0].value;
        this.selectedDurationUnit = 'years';
      }
    }
    // Otherwise use months
    else if (this.availableDurations.data.durations.months?.length) {
      this.selectedDurationValue = this.availableDurations.data.durations.months[0].value;
      this.selectedDurationUnit = 'months';
    }
  }

  hasDurationOptions(): boolean {
    if (!this.availableDurations) return false;
    return (this.availableDurations.data.durations.months?.length > 0 ||
      this.availableDurations.data.durations.years?.length > 0);
  }

  getDurationLabel(duration: IDurationPrice): string {
    if (duration.unit === 'months') {
      return `${duration.value} Month${duration.value > 1 ? 's' : ''}`;
    }
    return `${duration.value} Year${duration.value > 1 ? 's' : ''}`;
  }

  getFormattedPrice(amount: number): string {
    return '₹' + amount.toLocaleString('en-IN');
  }

  onDurationChange(): void {
    // Only recalculate if we have valid duration
    if (this.selectedDurationValue === 0) return;

    this.calculatePrice();

    // Reset coupon when duration changes
    if (this.isCouponApplied) {
      this.removeCoupon();
    }

    // Recalculate change plan price if in change plan mode
    if (this.isChangePlan && this.societyId && this.selectedPlan) {
      this.calculateChangePrice();
    }
  }

  getSelectedDurationPrice(): IDurationPrice | undefined {
    if (!this.availableDurations) return undefined;

    if (this.selectedDurationUnit === 'months') {
      return this.availableDurations.data.durations.months.find(
        d => d.value === this.selectedDurationValue
      );
    } else {
      return this.availableDurations.data.durations.years.find(
        d => d.value === this.selectedDurationValue
      );
    }
  }

  checkForCurrentPlan(): void {
    if (!this.societyId || !this.selectedPlan || this.selectedPlan.price === 'Free') {
      return;
    }

    this.isCurrentPlanLoading = true;
    this.pricingPlanService.getCurrentPlan(this.societyId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isCurrentPlanLoading = false;
        })
      )
      .subscribe({
        next: response => {
          if (response && response._id) {
            this.currentPlanDetails = response;

            // Check if current plan is Basic/Free
            const isCurrentPlanFree = response.price === 'Free' ||
              response.planName === 'Basic';

            // If current plan is not free and we have valid duration, this is a change plan
            if (!isCurrentPlanFree && this.selectedDurationValue !== 0) {
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
    if (!this.selectedPlan || !this.societyId || this.selectedDurationValue === 0) return;

    this.pricingPlanService.calculateChangePrice(
      this.societyId,
      this.selectedPlan.id,
      this.selectedDurationValue,
      this.selectedDurationUnit,
      couponCode
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
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
    this.societyService.getSociety(this.societyId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.societyLoading = false;
        })
      )
      .subscribe({
        next: (society) => {
          this.societyDetails = society;

          // After society loads, reload durations with society ID
          if (this.selectedPlan) {
            this.loadAvailableDurations();
          }
        },
        error: (error) => {
          console.error('Error fetching society:', error);
        }
      });
  }

  calculatePrice(): void {
    if (!this.selectedPlan) return;

    // Handle free plans
    if (this.selectedPlan.price === 'Free') {
      this.originalPrice = 0;
      this.totalPrice = 0;
      this.tentativeTotalPrice = 0;
      return;
    }

    // Don't calculate if duration not selected
    if (this.selectedDurationValue === 0) return;

    // Get selected duration price
    const selectedDurationPrice = this.getSelectedDurationPrice();

    if (selectedDurationPrice) {
      if (this.societyDetails?.numberOfFlats) {
        // Calculate price based on selected duration and actual flat count
        // The price from API already includes flat count, so use directly
        this.originalPrice = selectedDurationPrice.baseAmount;
        this.totalPrice = selectedDurationPrice.finalAmount;
        this.discountAmount = selectedDurationPrice.discount > 0 ? selectedDurationPrice.baseAmount - selectedDurationPrice.finalAmount : 0;
        this.discountPercentage = selectedDurationPrice.discount;
        this.tentativeTotalPrice = selectedDurationPrice.baseAmount;
      } else {
        // Tentative price with default flat count (from API response)
        const flatCount = this.availableDurations?.data.flatCount || 10;
        this.originalPrice = selectedDurationPrice.baseAmount;
        this.tentativeTotalPrice = selectedDurationPrice.baseAmount;
        this.totalPrice = selectedDurationPrice.finalAmount;
      }
    }
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
      : this.totalPrice;

    this.pricingPlanService.validateCoupon(this.couponCode, amountToDiscount)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
      this.calculatePrice();
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
        return;
      }
      if (!this.selectedPlan || !this.societyId) return;

      // Validate duration for paid plans
      if (this.selectedPlan.price !== 'Free' && this.selectedDurationValue === 0) {
        this.couponMessage = 'Please select a valid duration';
        return;
      }

      this.isProcessing = true;

      if (this.isChangePlan && this.changePlanCalculation) {
        // Use change plan API with duration
        this.pricingPlanService.changePlan(
          this.societyId,
          this.selectedPlan.id,
          this.selectedDurationValue,
          this.selectedDurationUnit,
          this.selectedPaymentMethod,
          { upiId: this.upiForm.get('upiId')?.value },
          this.isCouponApplied ? this.couponCode : undefined
        ).pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (plan) => {
              this.societyPlan = plan;
              this.purchaseComplete = true;
              this.isProcessing = false;
            },
            error: (error) => {
              console.error('Change plan failed:', error);
              this.couponMessage = error.error?.message || 'Failed to change plan';
              this.isProcessing = false;
            }
          });
      } else {
        // Use new purchase API with duration
        this.pricingPlanService.purchasePlan(
          this.societyId,
          this.selectedPlan.id,
          this.selectedDurationValue,
          this.selectedDurationUnit,
          undefined,
          this.isCouponApplied ? this.couponCode : undefined
        ).pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (plan) => {
              this.societyPlan = plan;
              this.purchaseComplete = true;
              this.isProcessing = false;
            },
            error: (error) => {
              console.error('Purchase failed:', error);
              this.couponMessage = error.error?.message || 'Failed to purchase plan';
              this.isProcessing = false;
            }
          });
      }

    } catch (err) {
      console.log('Error ', err);
      this.isProcessing = false;
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

  isStepValid(): boolean {
    if (!this.societyDetails && this.currentStep === 1) {
      return false;
    }

    // Validate duration selection for paid plans
    if (this.currentStep === 1 && this.selectedPlan && this.selectedPlan.price !== 'Free') {
      if (!this.isDurationLoaded || this.selectedDurationValue === 0) {
        return false;
      }
    }

    if (this.currentStep === 1) {
      return true;
    } else if (this.currentStep === 2) {
      return this.selectedPaymentMethod === 'upi';
    } else if (this.currentStep === 3) {
      return this.upiForm.valid;
    }
    return false;
  }

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