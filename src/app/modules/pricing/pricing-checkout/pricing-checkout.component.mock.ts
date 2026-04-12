// =========================
// BASE ENTITIES
// =========================

import { IPricingPlan } from "../../../interfaces";

export const mockProfile = {
    user: {
        name: 'Test User',
        email: 'test@mail.com'
    }
};

export const mockSociety = {
    _id: 'soc1',
    name: 'Test Society',
    numberOfFlats: 50
};

export const mockPlanPaid: IPricingPlan = {
    id: 'plan_123',
    name: 'Premium Plan',
    icon: 'fa-crown',
    price: '$99.00',
    priceSuffix: '/month',
    priceNote: 'Billed annually',
    period: 'monthly',
    badge: 'Most Popular',
    colors: {
        primary: '#6366f1',
        light: '#e0e7ff',
        lighter: '#eef2ff',
        border: '#c7d2fe',
        text: '#1e1b4b',
        button: '#4f46e5',
        buttonFrom: '#4f46e5',
        buttonTo: '#6366f1',
        buttonHover: '#4338ca',
        badgeBg: '#fef08a',
        gradientFrom: '#4f46e5',
        gradientTo: '#8b5cf6'
    },
    features: [
        {
            key: 'users',
            name: 'Team members',
            value: 'Up to 10',
            included: true,
            currentUsage: 3,
            limit: 10,
            hasLimit: true
        },
        {
            key: 'storage',
            name: 'Storage',
            value: '100 GB',
            included: true,
            currentUsage: 25,
            limit: 100,
            hasLimit: true
        }
    ],
    buttonText: 'Get Started',
    buttonVariant: 'popular',
    isPopular: true,
    isBestValue: false,
    featureCount: '2+ features',
    allowedDurations: {
        months: [1, 3, 6],
        years: [1, 2]
    },
    durationOptions: [
        { value: 1, unit: 'months', discount: 0 },
        { value: 3, unit: 'months', discount: 5 },
        { value: 6, unit: 'months', discount: 10 },
        { value: 1, unit: 'years', discount: 15 },
        { value: 2, unit: 'years', discount: 20 }
    ]
};

export const mockPlanFree = {
    id: 'plan2',
    name: 'Basic',
    price: 'Free'
};

// =========================
// DURATIONS
// =========================

export const mockDurations = {
    data: {
        flatCount: 50,
        durations: {
            months: [
                { value: 1, unit: 'months', baseAmount: 100, finalAmount: 90, discount: 10 },
                { value: 3, unit: 'months', baseAmount: 300, finalAmount: 250, discount: 16 }
            ],
            years: [
                { value: 1, unit: 'years', baseAmount: 1000, finalAmount: 800, discount: 20 }
            ]
        }
    }
};

export const mockEmptyDurations = {
    data: {
        flatCount: 0,
        durations: {
            months: [],
            years: []
        }
    }
};

// =========================
// CURRENT PLAN
// =========================

export const mockCurrentPlanPaid = {
    _id: 'cp1',
    planName: 'Premium',
    price: '1000'
};

export const mockCurrentPlanFree = {
    _id: 'cp2',
    planName: 'Basic',
    price: 'Free'
};

// =========================
// CHANGE PLAN CALCULATION
// =========================

export const mockChangePlanResponse = {
    calculation: {
        finalAmount: 500,
        amountToPay: 700,
        discount: 200
    }
};

export const mockChangePlanError = {
    error: {
        message: 'Invalid coupon'
    }
};

// =========================
// COUPON
// =========================

export const mockValidCoupon = {
    valid: true,
    discount: 200,
    finalAmount: 800
};

export const mockInvalidCoupon = {
    valid: false,
    message: 'Coupon not found'
};

export const mockCouponError = {
    error: {
        message: 'Server error'
    }
};

// =========================
// PURCHASE / PAYMENT
// =========================

export const mockPurchaseZeroAmount = {
    _id: 'sp1',
    totalAmount: 0
};

export const mockPurchaseWithOrder = {
    _id: 'sp2',
    razorpayOrderId: 'order_123',
    totalAmount: 100000
};

export const mockPurchaseNoOrderId = {
    _id: 'sp3'
};

export const mockPurchaseError = {
    error: {
        message: 'Purchase failed'
    }
};

// =========================
// PAYMENT VERIFICATION
// =========================

export const mockVerifySuccess = {
    success: true
};

export const mockVerifyFailure = {
    success: false,
    message: 'Verification failed'
};

export const mockVerifyError = {
    error: {
        message: 'Verification error'
    }
};

// =========================
// FORM STATES
// =========================

export const mockCouponFormValid = {
    couponCode: 'DISCOUNT10'
};

export const mockCouponFormEmpty = {
    couponCode: ''
};

// =========================
// EDGE CASE STATES
// =========================

export const mockNoSociety = null;
export const mockNoPlan = null;

export const mockZeroDuration = 0;

// =========================
// RAZORPAY RESPONSE
// =========================

export const mockRazorpayResponse = {
    razorpay_order_id: 'order_123',
    razorpay_payment_id: 'pay_123',
    razorpay_signature: 'signature_123'
};