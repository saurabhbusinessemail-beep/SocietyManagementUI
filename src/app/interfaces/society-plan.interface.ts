import { IPricingPlan } from "./pricing.interface";
import { ISociety } from "./society.interface";
import { IUser } from "./user.interface";

export interface ISocietyPlan {
    _id: string;
    societyId: string | ISociety;
    planId: string | IPricingPlan;
    planName: string;
    price: string;
    period?: string;
    featureCount?: string;
    features: Array<{
        featureKey: string;
        name: string;
        included: boolean;
        currentUsage: number;
        limit: number;
        hasLimit: boolean;
    }>;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    autoRenew: boolean;
    billingCycle: 'monthly' | 'yearly';
    totalAmount: number;
    paymentStatus: 'pending' | 'paid' | 'failed';
    purchasedBy?: string | IUser;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}