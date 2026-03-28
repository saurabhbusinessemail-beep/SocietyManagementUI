import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
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
import { take, takeUntil, finalize, switchMap } from 'rxjs/operators';
import { Subject, of, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

declare const Razorpay: any;

@Component({
  selector: 'app-pricing-checkout',
  templateUrl: './pricing-checkout.component.html',
  styleUrls: ['./pricing-checkout.component.scss']
})
export class PricingCheckoutComponent implements OnInit, OnDestroy {
  // Properties (all existing)
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

  societyLoading = false;

  // Form groups
  couponForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    public loginService: LoginService,
    private pricingPlanService: PricingPlanService,
    private societyService: SocietyService,
    private location: Location,
    private ngZone: NgZone,
  ) {
    this.couponForm = this.fb.group({ couponCode: [''] });
  }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();

    this.route.params.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.societyId = params['societyId'];
        const planId = params['planId'];

        if (this.societyId) {
          this.paramHasSocietyId = true;
          this.loadSociety(this.societyId);
        }

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
    if (this.pricingPlanService.plans.length > 0) {
      const plan = this.pricingPlanService.plans.find(p => p.id === planId);
      return of(plan);
    }
    return this.pricingPlanService.getPlanById(planId).pipe(take(1));
  }

  loadAvailableDurations(): void {
    if (!this.selectedPlan) return;

    if (this.selectedPlan.price === 'Free') {
      this.showDurationSelector = false;
      this.calculatePrice();
      return;
    }

    this.isLoadingDurations = true;
    this.pricingPlanService.getPlanDurations(this.selectedPlan.id, this.societyId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingDurations = false)
      )
      .subscribe({
        next: (response) => {
          this.availableDurations = response;
          this.showDurationSelector = this.hasDurationOptions();
          this.isDurationLoaded = true;
          this.setDefaultDuration();
          this.calculatePrice();

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

    this.selectedDurationValue = 0;

    if (this.availableDurations.data.durations.years?.length) {
      const defaultYear = this.availableDurations.data.durations.years.find(y => y.value === 1);
      if (defaultYear) {
        this.selectedDurationValue = 1;
        this.selectedDurationUnit = 'years';
      } else {
        this.selectedDurationValue = this.availableDurations.data.durations.years[0].value;
        this.selectedDurationUnit = 'years';
      }
    } else if (this.availableDurations.data.durations.months?.length) {
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
    return '₹' + Math.ceil(amount).toLocaleString('en-IN');
  }

  onDurationChange(): void {
    if (this.selectedDurationValue === 0) return;

    this.calculatePrice();

    if (this.isCouponApplied) {
      this.removeCoupon();
    }

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
        finalize(() => this.isCurrentPlanLoading = false)
      )
      .subscribe({
        next: response => {
          if (response && response._id) {
            this.currentPlanDetails = response;
            const isCurrentPlanFree = response.price === 'Free' || response.planName === 'Basic';

            if (!isCurrentPlanFree && this.selectedDurationValue !== 0) {
              this.isChangePlan = true;
              this.calculateChangePrice();
            }
          }
        },
        error: () => { /* No current plan - new purchase */ }
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
        next: () => {
          setTimeout(() => {
            this.myProfile = this.loginService.getProfileFromStorage();
          }, 300);
        }
      });
  }

  loadSociety(societyId: string) {
    this.societyLoading = true;
    this.societyService.getSociety(societyId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.societyLoading = false)
      )
      .subscribe({
        next: (society) => {
          this.societyDetails = society;
          if (this.selectedPlan) {
            this.loadAvailableDurations();
          }
        },
        error: (error) => console.error('Error fetching society:', error)
      });
  }

  calculatePrice(): void {
    if (!this.selectedPlan) return;

    if (this.selectedPlan.price === 'Free') {
      this.originalPrice = 0;
      this.totalPrice = 0;
      this.tentativeTotalPrice = 0;
      return;
    }

    if (this.selectedDurationValue === 0) return;

    const selectedDurationPrice = this.getSelectedDurationPrice();

    if (selectedDurationPrice) {
      if (this.societyDetails?.numberOfFlats) {
        this.originalPrice = selectedDurationPrice.baseAmount;
        this.totalPrice = selectedDurationPrice.finalAmount;
        this.discountAmount = selectedDurationPrice.discount > 0 ? selectedDurationPrice.baseAmount - selectedDurationPrice.finalAmount : 0;
        this.discountPercentage = selectedDurationPrice.discount;
        this.tentativeTotalPrice = selectedDurationPrice.baseAmount;
      } else {
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

    let amountToDiscount = this.isChangePlan && this.changePlanCalculation
      ? (this.changePlanCalculation.calculation?.amountToPay ?? 0)
      : this.totalPrice;

    this.pricingPlanService.validateCoupon(this.couponCode, amountToDiscount)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.valid) {
            if (this.isChangePlan) {
              this.calculateChangePrice(this.couponCode);
            } else {
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
      this.calculateChangePrice();
    } else {
      this.calculatePrice();
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

  changePlan() {
    this.router.navigate(['pricing-plan/list', this.societyId]);
  }

  getLoggedIn() {
    return new Promise((resolve, reject) => {
      this.loginService.loginAndReturn()
        .pipe(take(1))
        .subscribe({
          next: resolve,
          error: reject
        });
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
      this.router.navigate(['society', this.societyId, 'details']);
      return;
    }
    this.location.back();
  }

  // New validation method (replaces isStepValid)
  isCheckoutValid(): boolean {
    if (!this.societyDetails) return false;
    if (this.selectedPlan && this.selectedPlan.price !== 'Free') {
      if (!this.isDurationLoaded || this.selectedDurationValue === 0) return false;
    }
    // No payment method validation needed because Razorpay handles it
    return true;
  }

  // Main entry point for payment
  processPayment(): void {
    if (this.isProcessing) return;

    if (!this.myProfile) {
      this.triggerLogin();
      return;
    }
    if (!this.societyId) {
      this.getSociety();
      return;
    }
    if (!this.selectedPlan) return;
    if (this.selectedPlan.price !== 'Free' && this.selectedDurationValue === 0) {
      this.couponMessage = 'Please select a valid duration';
      return;
    }

    this.isProcessing = true;

    // Call the appropriate service method
    const purchaseObservable = this.isChangePlan
      ? this.pricingPlanService.changePlan(
        this.societyId,
        this.selectedPlan.id,
        this.selectedDurationValue,
        this.selectedDurationUnit,
        undefined,           // paymentMethod not needed – Razorpay handles it
        undefined,           // paymentDetails not needed
        this.isCouponApplied ? this.couponCode : undefined
      )
      : this.pricingPlanService.purchasePlan(
        this.societyId,
        this.selectedPlan.id,
        this.selectedDurationValue,
        this.selectedDurationUnit,
        undefined,
        this.isCouponApplied ? this.couponCode : undefined
      );

    purchaseObservable.pipe(take(1)).subscribe({
      next: (societyPlan: ISocietyPlan) => {
        this.societyPlan = societyPlan;

        // If amount is 0, we are done
        if (this.totalPrice === 0) {
          this.purchaseComplete = true;
          this.isProcessing = false;
        } else {
          // Expect societyPlan to have razorpayOrderId
          if (societyPlan.razorpayOrderId) {
            this.openRazorpayCheckout(societyPlan);
          } else {
            this.couponMessage = 'Unable to initiate payment. No order ID received.';
            this.isProcessing = false;
          }
        }
      },
      error: (error) => {
        console.error('Purchase failed:', error);
        this.couponMessage = error.error?.message || 'Failed to initiate purchase. Please try again.';
        this.isProcessing = false;
      }
    });
  }

  private openRazorpayCheckout(societyPlan: ISocietyPlan): void {
    const keyId = environment.RAZORPAY_KEY_ID;

    const options = {
      key: keyId,
      amount: societyPlan.totalAmount || this.totalPrice * 100, // amount in paise
      currency: 'INR',
      name: 'Your App Name',
      description: `Payment for ${this.selectedPlan?.name} Plan`,
      order_id: societyPlan.razorpayOrderId,
      handler: (response: any) => {
        // After payment success, verify on backend
        this.verifyPayment(response, societyPlan);
      },
      prefill: {
        name: this.myProfile?.user?.name || '',
        email: this.myProfile?.user?.email || '',
        // contact: optional, can be left out
      },
      theme: { color: '#3399cc' },
      modal: {
        ondismiss: () => {
          this.isProcessing = false;
          this.couponMessage = 'Payment cancelled.';
        }
      }
    };

    this.loadRazorpayScript().then(() => {
      const rzp = new Razorpay(options);
      rzp.open();
    }).catch(() => {
      this.isProcessing = false;
      this.couponMessage = 'Failed to load payment gateway. Please check your connection.';
    });
  }

  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Razorpay !== 'undefined') {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });
  }

  private verifyPayment(paymentResponse: any, societyPlan: ISocietyPlan): void {
    // Call backend to verify payment and finalize purchase
    this.pricingPlanService.verifyPayment({
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
      societyPlanId: societyPlan._id
    }).pipe(takeUntil(this.destroy$), finalize(() => {
      this.ngZone.run(() => {
        this.isProcessing = false;
      });
    }))
      .subscribe({
        next: (result) => {
          this.ngZone.run(() => {
            if (result.success) {
              this.purchaseComplete = true;
            } else {
              this.couponMessage = result.message || 'Payment verification failed. Please contact support.';
            }
          });
        },
        error: (error) => {
          console.error('Verification error:', error);
          this.couponMessage = error.error?.message || 'Payment verification failed.';
        }
      });
  }
}