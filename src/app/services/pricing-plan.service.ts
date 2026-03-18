import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IChangePlanCalculation, ICurrentPlanResponse, IFeature, IPagedResponse, IPlanHistoryItem, IPricingPlan, ISocietyPlan } from '../interfaces';
import { Cacheable, InvalidateCache } from '../decorators';

@Injectable({
    providedIn: 'root'
})
export class PricingPlanService {
    private baseUrl = `${environment.apiBaseUrl}/pricing-plan`; // Adjust base URL as per your API structure


    features: IFeature[] = [
        { key: 'number_of_buildings', name: 'Number of Buildings' },
        { key: 'number_of_flats', name: 'Number of Flats' },
        { key: 'gate_entries', name: 'Gate Entries' },
        { key: 'announcements', name: 'Announcements' },
        { key: 'smart_gate_pass', name: 'Smart Gate Pass' },
        { key: 'visitor_management', name: 'Visitor Management' },
        { key: 'tenant_management', name: 'Tenant Management' },
        { key: 'flat_member_management', name: 'Flat Member Management' },
        { key: 'complaints', name: 'Complaints' },
        { key: 'vehicle', name: 'Vehicle' },
        { key: 'parking', name: 'Parking' },
        { key: 'communication', name: 'Communication' },
        { key: 'maintenance', name: 'Maintenance' },
        { key: 'offers_on_festivals', name: 'Offers On Festivals' }
    ];
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
                { key: 'number_of_buildings', name: 'Number of Buildings', value: '1 Building', included: true },
                { key: 'number_of_flats', name: 'Number of Flats', value: '10 Flats', included: true },
                { key: 'gate_entries', name: 'Gate Entries', included: true },
                { key: 'announcements', name: 'Announcements', included: true },
                { key: 'smart_gate_pass', name: 'Smart Gate Pass', included: false },
                { key: 'visitor_management', name: 'Visitor Management', included: false },
                { key: 'tenant_management', name: 'Tenant Management', included: false },
                { key: 'flat_member_management', name: 'Flat Member Management', included: false },
                { key: 'complaints', name: 'Complaints', included: false },
                { key: 'events', name: 'Events', included: false },
                { key: 'parking_vehicle', name: 'Parking / Vehicle', included: false },
                { key: 'communication', name: 'Communication', included: false },
                { key: 'maintenance', name: 'Maintenance', included: false },
                { key: 'offers_on_festivals', name: 'Offers On Festivals', included: false }
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
                { key: 'number_of_buildings', name: 'Number of Buildings', value: 'Unlimited', included: true },
                { key: 'number_of_flats', name: 'Number of Flats', value: 'Unlimited', included: true },
                { key: 'gate_entries', name: 'Gate Entries', included: true },
                { key: 'announcements', name: 'Announcements', included: true },
                { key: 'smart_gate_pass', name: 'Smart Gate Pass', included: true },
                { key: 'visitor_management', name: 'Visitor Management', included: true },
                { key: 'tenant_management', name: 'Tenant Management', included: true },
                { key: 'flat_member_management', name: 'Flat Member Management', included: true },
                { key: 'complaints', name: 'Complaints', included: false },
                { key: 'events', name: 'Events', included: false },
                { key: 'parking_vehicle', name: 'Parking / Vehicle', included: false },
                { key: 'communication', name: 'Communication', included: false },
                { key: 'maintenance', name: 'Maintenance', included: false },
                { key: 'offers_on_festivals', name: 'Offers On Festivals', included: true }
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
                { key: 'number_of_buildings', name: 'Number of Buildings', value: 'Unlimited', included: true },
                { key: 'number_of_flats', name: 'Number of Flats', value: 'Unlimited', included: true },
                { key: 'gate_entries', name: 'Gate Entries', included: true },
                { key: 'announcements', name: 'Announcements', included: true },
                { key: 'smart_gate_pass', name: 'Smart Gate Pass', included: true },
                { key: 'visitor_management', name: 'Visitor Management', included: true },
                { key: 'tenant_management', name: 'Tenant Management', included: true },
                { key: 'flat_member_management', name: 'Flat Member Management', included: true },
                { key: 'complaints', name: 'Complaints', included: true },
                { key: 'events', name: 'Events', included: true },
                { key: 'parking_vehicle', name: 'Parking / Vehicle', included: true },
                { key: 'communication', name: 'Communication', included: false },
                { key: 'maintenance', name: 'Maintenance', included: false },
                { key: 'offers_on_festivals', name: 'Offers On Festivals', included: true }
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
                { key: 'number_of_buildings', name: 'Number of Buildings', value: 'Unlimited', included: true },
                { key: 'number_of_flats', name: 'Number of Flats', value: 'Unlimited', included: true },
                { key: 'gate_entries', name: 'Gate Entries', included: true },
                { key: 'announcements', name: 'Announcements', included: true },
                { key: 'smart_gate_pass', name: 'Smart Gate Pass', included: true },
                { key: 'visitor_management', name: 'Visitor Management', included: true },
                { key: 'tenant_management', name: 'Tenant Management', included: true },
                { key: 'flat_member_management', name: 'Flat Member Management', included: true },
                { key: 'complaints', name: 'Complaints', included: true },
                { key: 'events', name: 'Events', included: true },
                { key: 'parking_vehicle', name: 'Parking / Vehicle', included: true },
                { key: 'communication', name: 'Communication', included: true },
                { key: 'maintenance', name: 'Maintenance', included: false },
                { key: 'offers_on_festivals', name: 'Offers On Festivals', included: true }
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
                { key: 'number_of_buildings', name: 'Number of Buildings', value: 'Unlimited', included: true },
                { key: 'number_of_flats', name: 'Number of Flats', value: 'Unlimited', included: true },
                { key: 'gate_entries', name: 'Gate Entries', included: true },
                { key: 'announcements', name: 'Announcements', included: true },
                { key: 'smart_gate_pass', name: 'Smart Gate Pass', included: true },
                { key: 'visitor_management', name: 'Visitor Management', included: true },
                { key: 'tenant_management', name: 'Tenant Management', included: true },
                { key: 'flat_member_management', name: 'Flat Member Management', included: true },
                { key: 'complaints', name: 'Complaints', included: true },
                { key: 'events', name: 'Events', included: true },
                { key: 'parking_vehicle', name: 'Parking / Vehicle', included: true },
                { key: 'communication', name: 'Communication', included: true },
                { key: 'maintenance', name: 'Maintenance', included: true },
                { key: 'offers_on_festivals', name: 'Offers On Festivals', included: true }
            ]
        }
    ];

    constructor(private http: HttpClient) { }

    /**
     * Purchase a plan for a society
     * Invalidate current plan and history caches
     */
    @InvalidateCache({
        methods: [
            'PricingPlanService.getCurrentPlan*',
            'PricingPlanService.getPlanHistory*'
        ],
        matchParams: true,
        paramIndices: [0], // Invalidate based on societyId
        groups: ['pricing-plans']
    })
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
     * Cache current plan for 5 minutes
     */
    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0],
        group: 'pricing-plans'
    })
    getCurrentPlan(societyId: string): Observable<ICurrentPlanResponse> {
        return this.http.get<ICurrentPlanResponse>(`${this.baseUrl}/current-plan/${societyId}`);
    }

    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1, 2],
        paramKeys: {
            1: ['page'],
            2: ['limit']
        },
        group: 'pricing-plans',
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId, page = 1, limit = 10] = args;
            return `${methodName}_${societyId}_page${page}_limit${limit}`;
        }
    })
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

    @InvalidateCache({
        methods: [
            'PricingPlanService.getCurrentPlan*',
            'PricingPlanService.getPlanHistory*'
        ],
        matchParams: true,
        paramIndices: [0], // Invalidate based on societyId
        groups: ['pricing-plans']
    })
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

    /**
     * Validate coupon code
     * Cache coupon validation for 1 hour (coupons don't change often)
     */
    @Cacheable({
        // ttl: 3600000, // 1 hour
        paramIndices: [0, 1],
        paramKeys: {
            0: ['couponCode'],
            1: ['amount']
        },
        group: 'pricing-plans'
    })
    validateCoupon(couponCode: string, amount: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/validate-coupon`, { couponCode, amount });
    }
}