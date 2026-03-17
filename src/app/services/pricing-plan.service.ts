import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IChangePlanCalculation, ICurrentPlanResponse, IPagedResponse, IPlanHistoryItem, IPricingPlan, ISocietyPlan } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class PricingPlanService {
    private baseUrl = `${environment.apiBaseUrl}/pricing-plan`; // Adjust base URL as per your API structure

    plans: IPricingPlan[] = [
        {
            id: 'basic',
            name: 'Basic',
            icon: 'building2',
            price: 'Free',
            period: 'forever',
            buttonText: 'Get Started',
            colors: {
                primary: '#475569',        // slate-600 (icon)
                light: '#e2e8f0',          // slate-200 (icon bg, border)
                lighter: '#f1f5f9',        // slate-100 (gradient from)
                border: '#e2e8f0',         // slate-200
                text: '#334155',           // slate-700 (price)
                button: '#334155',         // slate-700
                buttonHover: '#1e293b',    // slate-800
                gradientFrom: '#f1f5f9',   // slate-100
                gradientTo: '#f8fafc',
            },
            features: [
                { name: 'Add Buildings', value: '1 Building', included: true },
                { name: 'Number of Flats', value: '10–12 Flats', included: true },
                { name: 'Gate Entries', included: true },
                { name: 'Announcements', included: true },
                { name: 'Smart Gate Pass', included: false },
                { name: 'Visitor Management', included: false },
                { name: 'Tenant Management', included: false },
                { name: 'Flat Member Management', included: false },
                { name: 'Complaints', included: false },
                { name: 'Events', included: false },
                { name: 'Parking / Vehicle', included: false },
                { name: 'Communication', included: false },
                { name: 'Maintenance', included: false },
                { name: 'Offers & Festivals', included: false }
            ]
        },
        {
            id: 'silver',
            name: 'Silver',
            icon: 'star',
            price: '10',
            priceSuffix: '₹',
            priceNote: '/flat',
            period: 'mo, billed yearly',
            buttonText: 'Get Started',
            colors: {
                primary: '#1d4ed8',        // blue-700 (icon, price)
                light: '#bfdbfe',          // blue-200 (icon bg, border)
                lighter: '#dbeafe',        // blue-100 (gradient from)
                border: '#bfdbfe',         // blue-200
                text: '#1d4ed8',           // blue-700
                button: '#2563eb',         // blue-600
                buttonHover: '#1d4ed8',    // blue-700
                gradientFrom: '#dbeafe',   // blue-100
                gradientTo: '#eff6ff'      // blue-50
            },
            features: [
                { name: 'Add Buildings', value: 'Unlimited', included: true },
                { name: 'Number of Flats', value: 'Unlimited', included: true },
                { name: 'Gate Entries', included: true },
                { name: 'Announcements', included: true },
                { name: 'Smart Gate Pass', included: true },
                { name: 'Visitor Management', included: true },
                { name: 'Tenant Management', included: true },
                { name: 'Flat Member Management', included: true },
                { name: 'Complaints', included: false },
                { name: 'Events', included: false },
                { name: 'Parking / Vehicle', included: false },
                { name: 'Communication', included: false },
                { name: 'Maintenance', included: false },
                { name: 'Offers & Festivals', included: true }
            ]
        },
        {
            id: 'gold',
            name: 'Gold',
            icon: 'zap',
            price: '20',
            priceSuffix: '₹',
            priceNote: '/flat',
            period: 'mo, billed yearly',
            badge: 'POPULAR',
            buttonText: 'Get Started',
            isPopular: true,
            colors: {
                primary: '#b45309',        // amber-700 (icon, price)
                light: '#fcd34d',          // amber-300 (icon bg, border)
                lighter: '#fde68a',        // amber-200 (gradient from)
                border: '#fcd34d',         // amber-300
                text: '#b45309',           // amber-700
                badgeBg: '#f59e0b',        // amber-500
                buttonFrom: '#f59e0b',     // amber-500
                buttonTo: '#eab308',       // yellow-500
                gradientFrom: '#fde68a',   // amber-200
                gradientTo: '#fffbeb'      // amber-50
            },
            features: [
                { name: 'Add Buildings', value: 'Unlimited', included: true },
                { name: 'Number of Flats', value: 'Unlimited', included: true },
                { name: 'Gate Entries', included: true },
                { name: 'Announcements', included: true },
                { name: 'Smart Gate Pass', included: true },
                { name: 'Visitor Management', included: true },
                { name: 'Tenant Management', included: true },
                { name: 'Flat Member Management', included: true },
                { name: 'Complaints', included: true },
                { name: 'Events', included: true },
                { name: 'Parking / Vehicle', included: true },
                { name: 'Communication', included: false },
                { name: 'Maintenance', included: false },
                { name: 'Offers & Festivals', included: true }
            ]
        },
        {
            id: 'platinum',
            name: 'Platinum',
            icon: 'award',
            price: '30',
            priceSuffix: '₹',
            priceNote: '/flat',
            period: 'mo, billed yearly',
            buttonText: 'Get Started',
            colors: {
                primary: '#6d28d9',        // violet-700 (icon, price)
                light: '#ddd6fe',          // violet-200 (icon bg, border)
                lighter: '#ede9fe',        // violet-100 (gradient from)
                border: '#ddd6fe',         // violet-200
                text: '#6d28d9',           // violet-700
                button: '#7c3aed',         // violet-600
                buttonHover: '#6d28d9',    // violet-700
                gradientFrom: '#ede9fe',   // violet-100
                gradientTo: '#f5f3ff'      // violet-50
            },
            features: [
                { name: 'Add Buildings', value: 'Unlimited', included: true },
                { name: 'Number of Flats', value: 'Unlimited', included: true },
                { name: 'Gate Entries', included: true },
                { name: 'Announcements', included: true },
                { name: 'Smart Gate Pass', included: true },
                { name: 'Visitor Management', included: true },
                { name: 'Tenant Management', included: true },
                { name: 'Flat Member Management', included: true },
                { name: 'Complaints', included: true },
                { name: 'Events', included: true },
                { name: 'Parking / Vehicle', included: true },
                { name: 'Communication', included: true },
                { name: 'Maintenance', included: false },
                { name: 'Offers & Festivals', included: true }
            ]
        },
        {
            id: 'diamond',
            name: 'Diamond',
            icon: 'gem',
            price: '40',
            priceSuffix: '₹',
            priceNote: '/flat',
            period: 'mo, billed yearly',
            badge: 'BEST VALUE',
            buttonText: 'Get Started',
            isBestValue: true,
            colors: {
                primary: '#0f766e',        // teal-700 (icon, price)
                light: '#99f6e4',          // teal-200 (icon bg, border)
                lighter: '#ccfbf1',        // teal-100 (gradient from)
                border: '#99f6e4',         // teal-200
                text: '#0f766e',           // teal-700
                badgeBg: '#14b8a6',        // teal-500
                buttonFrom: '#14b8a6',     // teal-500
                buttonTo: '#06b6d4',       // cyan-500
                gradientFrom: '#ccfbf1',   // teal-100
                gradientTo: '#f0fdfa'      // teal-50
            },
            features: [
                { name: 'Add Buildings', value: 'Unlimited', included: true },
                { name: 'Number of Flats', value: 'Unlimited', included: true },
                { name: 'Gate Entries', included: true },
                { name: 'Announcements', included: true },
                { name: 'Smart Gate Pass', included: true },
                { name: 'Visitor Management', included: true },
                { name: 'Tenant Management', included: true },
                { name: 'Flat Member Management', included: true },
                { name: 'Complaints', included: true },
                { name: 'Events', included: true },
                { name: 'Parking / Vehicle', included: true },
                { name: 'Communication', included: true },
                { name: 'Maintenance', included: true },
                { name: 'Offers & Festivals', included: true }
            ]
        }
    ];

    constructor(private http: HttpClient) { }

    /**
     * Purchase a plan for a society
     * @param societyId - Society ID
     * @param planId - Plan ID to purchase
     * @param billingCycle - 'monthly' or 'yearly' (default: 'yearly')
     */
    purchasePlan(societyId: string, planId: string, billingCycle: 'monthly' | 'yearly' = 'yearly', couponCode?: string): Observable<ISocietyPlan> {
        const payload: any = { planId, billingCycle };
        if (couponCode) {
            payload.couponCode = couponCode;
        }
        return this.http.post<ISocietyPlan>(
            `${this.baseUrl}/purchase/${societyId}`,
            payload
        );
    }

    /**
     * Get society's current active plan
     * @param societyId - Society ID
     */
    getCurrentPlan(societyId: string): Observable<ICurrentPlanResponse> {
        return this.http.get<ICurrentPlanResponse>(`${this.baseUrl}/current-plan/${societyId}`);
    }

    getPlanHistory(societyId: string, page: number = 1, limit: number = 10): Observable<IPagedResponse<IPlanHistoryItem>> {
        return this.http.get<IPagedResponse<IPlanHistoryItem>>(`${this.baseUrl}/history/${societyId}`, {
            params: { page: page.toString(), limit: limit.toString() }
        });
    }

    calculateChangePrice(societyId: string, newPlanId: string, couponCode?: string): Observable<IChangePlanCalculation> {
        const payload: any = { societyId, newPlanId };
        if (couponCode) {
            payload.couponCode = couponCode;
        }
        return this.http.post<IChangePlanCalculation>(`${this.baseUrl}/calculate-change`, payload);
    }

    changePlan(societyId: string, newPlanId: string, billingCycle: string = 'yearly', paymentMethod?: string, paymentDetails?: any, couponCode?: string): Observable<any> {
        const payload: any = {
            newPlanId,
            billingCycle,
            paymentMethod,
            paymentDetails
        };
        if (couponCode) {
            payload.couponCode = couponCode;
        }
        return this.http.post(`${this.baseUrl}/change/${societyId}`, payload);
    }

    validateCoupon(couponCode: string, amount: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/validate-coupon`, { couponCode, amount });
    }
}