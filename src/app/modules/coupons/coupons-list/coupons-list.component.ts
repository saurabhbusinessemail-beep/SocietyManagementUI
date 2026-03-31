import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ICoupon, IDiscountResult } from '../../../interfaces';
import { CouponService } from '../../../services/coupon.service';
import { PricingPlanService } from '../../../services/pricing-plan.service';

@Component({
  selector: 'app-coupons-list',
  templateUrl: './coupons-list.component.html',
  styleUrl: './coupons-list.component.scss'
})
export class CouponsListComponent implements OnInit, OnDestroy {
  coupons: ICoupon[] = [];
  plans: any[] = []; // IPricingPlan[]
  isLoading = false;
  errorMessage = '';

  // UI states
  showModal = false;
  editingCoupon: ICoupon | null = null;
  discountTestResult: IDiscountResult | null = null;
  testCouponCode = '';
  testAmount = 1000;
  testPlanId: string | null = null;

  couponForm: FormGroup;
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private couponService: CouponService,
    private pricingPlanService: PricingPlanService
  ) {
    this.couponForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/i)]],
      type: ['percentage', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      planId: [null],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadPlans();
    this.loadCoupons();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getPlanName(planId: string | null): string {
    if (!planId) return '';
    const plan = this.plans.find(p => p.id === planId);
    return plan ? plan.name : planId;
  }

  loadPlans(): void {
    this.subscriptions.add(
      this.pricingPlanService.getPlans().subscribe({
        next: (plans) => {
          this.plans = plans;
        },
        error: (err) => {
          console.error('Failed to load plans', err);
          this.errorMessage = 'Could not load pricing plans';
        }
      })
    );
  }

  loadCoupons(filterActive?: boolean, filterPlanId?: string): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.couponService.getCoupons(filterActive, filterPlanId).subscribe({
        next: (res) => {
          this.coupons = res.data ?? [];
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load coupons';
          this.isLoading = false;
        }
      })
    );
  }

  openCreateModal(): void {
    this.editingCoupon = null;
    this.couponForm.reset({
      type: 'percentage',
      value: 0,
      planId: null,
      isActive: true
    });
    this.showModal = true;
  }

  openEditModal(coupon: ICoupon): void {
    this.editingCoupon = coupon;
    this.couponForm.patchValue({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      planId: coupon.planId,
      isActive: coupon.isActive
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCoupon = null;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.couponForm.invalid) {
      Object.keys(this.couponForm.controls).forEach(key => {
        this.couponForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.couponForm.value;
    const payload: Partial<ICoupon> = {
      code: formValue.code.toUpperCase(),
      type: formValue.type,
      value: formValue.value,
      planId: formValue.planId && formValue.planId !== 'null' ? formValue.planId : null,
      isActive: formValue.isActive
    };

    this.isLoading = true;
    let request;
    if (this.editingCoupon) {
      request = this.couponService.updateCoupon(this.editingCoupon.code, payload);
    } else {
      request = this.couponService.createCoupon(payload);
    }

    this.subscriptions.add(
      request.subscribe({
        next: () => {
          this.closeModal();
          this.loadCoupons(); // refresh list (invalidates caches automatically)
        },
        error: (err) => {
          this.errorMessage = err.message || 'Operation failed';
          this.isLoading = false;
        }
      })
    );
  }

  deleteCoupon(coupon: ICoupon): void {
    if (confirm(`Delete coupon "${coupon.code}"?`)) {
      this.isLoading = true;
      this.subscriptions.add(
        this.couponService.deleteCoupon(coupon.code).subscribe({
          next: () => {
            this.loadCoupons();
          },
          error: (err) => {
            this.errorMessage = err.message || 'Delete failed';
            this.isLoading = false;
          }
        })
      );
    }
  }

  toggleActive(coupon: ICoupon): void {
    const newStatus = !coupon.isActive;
    this.subscriptions.add(
      this.couponService.updateCoupon(coupon.code, { isActive: newStatus }).subscribe({
        next: () => {
          coupon.isActive = newStatus;
          // optionally refresh list, but we can update locally
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to update status';
        }
      })
    );
  }

  testDiscount(): void {
    if (!this.testCouponCode) return;
    this.subscriptions.add(
      this.couponService.calculateDiscount(this.testCouponCode, this.testAmount, this.testPlanId).subscribe({
        next: (res) => {
          this.discountTestResult = res.data ?? null;
        },
        error: (err) => {
          this.discountTestResult = null;
          this.errorMessage = err.message || 'Invalid coupon or amount';
        }
      })
    );
  }

  // Helper for form validation
  get formControls() {
    return this.couponForm.controls;
  }
}
