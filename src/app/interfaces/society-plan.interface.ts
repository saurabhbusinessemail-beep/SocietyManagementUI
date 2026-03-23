import { IPricingFeature, IPricingPlan } from "./pricing.interface";
import { ISociety } from "./society.interface";
import { IUser } from "./user.interface";

export interface ISelectedDuration {
  value: number;
  unit: 'months' | 'years';
}

export interface ISocietyPlan {
  _id: string;
  societyId: string | ISociety;
  planId: string | IPricingPlan;
  planName: string;
  price: string;
  period?: string;
  featureCount?: string;
  features: IPricingFeature[];
  selectedDuration?: ISelectedDuration;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  autoRenew: boolean;
  billingCycle: 'monthly' | 'yearly';
  totalAmount: number;
  discountAmount?: number;
  finalAmount?: number;
  couponCode?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  purchasedBy?: string | IUser;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  razorpayOrderId?: string;
}

export interface ICurrentPlanResponse extends ISocietyPlan {
  planDetails: {
    _id: string;
    icon: string;
    featureCount: string;
    buttonText: string;
    buttonVariant: string;
    isPopular: boolean;
    isBestValue: boolean;
    isActive: boolean;
    sortOrder: number;
    id: string;
    name: string;
    price: string;
    priceSuffix: string;
    priceNote: string;
    period: string;
    colors: {
      primary: string;
      light: string;
      lighter: string;
      border: string;
      text: string;
      gradientFrom: string;
      gradientTo: string;
      button?: string;
      buttonHover?: string;
      badgeBg?: string;
      buttonFrom?: string;
      buttonTo?: string;
    };
    features: IPricingFeature[];
  };
  usage: {
    daysUsed: number;
    remainingDays: number;
    usedPercentage: number;
    startDate: string;
    endDate: string;
  };
}

export interface IPlanHistoryItem extends ISocietyPlan {
  planDetails?: {
    _id: string;
    icon: string;
    colors: {
      primary: string;
      light: string;
      gradientFrom: string;
      gradientTo: string;
    };
  };
}

export interface IChangePlanCalculation {
  currentPlan?: {
    id: string;
    name: string;
    price: string;
    duration?: ISelectedDuration;
    value: number;
    startDate: string;
    endDate?: string;
    daysUsed: number;
    usedValue: number;
    remainingValue: number;
    totalDays?: number;
  };
  newPlan: {
    id: string;
    name: string;
    price: string;
    duration?: ISelectedDuration;
    value: number;
  };
  flatCount: number;
  calculation: {
    amountToPay: number;
    paymentReason: string;
    daysUsed: number;
    totalDays: number;
    usedValue: number;
    remainingValue: number;
    newPlanValue: number;
    discount: number;
    finalAmount: number;
    couponCode: string | null;
  };
}

export interface IDurationPrice {
  value: number;
  unit: string;
  baseAmount: number;
  discount: number;
  finalAmount: number;
  savings?: number;
  monthlyEquivalent?: number;
}

export interface IPlanDurationsResponse {
  success: boolean;
  data: {
    planId: string;
    planName: string;
    monthlyPricePerFlat: number;
    flatCount: number;
    durations: {
      months: IDurationPrice[];
      years: IDurationPrice[];
    };
  };
}

export interface IPaymentVerificationPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  societyPlanId: string;
}