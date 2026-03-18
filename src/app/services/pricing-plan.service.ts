import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { IBEResponseFormat, IChangePlanCalculation, ICurrentPlanResponse, IFeature, IPagedResponse, IPlanHistoryItem, IPricingPlan, ISocietyPlan } from '../interfaces';
import { Cacheable, InvalidateCache } from '../decorators';

@Injectable({
    providedIn: 'root'
})
export class PricingPlanService {
    private baseUrl = `${environment.apiBaseUrl}/pricing-plan`; // Adjust base URL as per your API structure

    features: IFeature[] = [];
    plans: IPricingPlan[] = [];

    constructor(private http: HttpClient) { }

    @Cacheable({
        // ttl: 3600000, // 1 hour
        group: 'pricing-plans',
        keyGenerator: () => 'features'
    })
    loadFeatures(): Observable<IFeature[]> {
        return this.http.get<IPagedResponse<IFeature>>(`${this.baseUrl}/features`)
            .pipe(
                map(response => response.data),
                tap(response => {
                    this.features = response;
                }),
                catchError(error => {
                    console.error('Error loading features:', error);
                    return of([]);
                })
            );
    }

    @Cacheable({
        // ttl: 3600000, // 1 hour
        group: 'pricing-plans',
        keyGenerator: () => 'plans'
    })
    loadPlans(): Observable<IPricingPlan[]> {
        return this.http.get<{ success: boolean; data: IPricingPlan[] }>(`${this.baseUrl}/plans`)
            .pipe(
                map(response => response.data),
                tap(plans => {
                    this.plans = plans;
                }),
                catchError(error => {
                    console.error('Error loading pricing plans:', error);
                    return of([]);
                }),
                shareReplay(1)
            );
    }

    getFeatures(): Observable<IFeature[]> {
        if (this.features.length > 0) {
            return of(this.features);
        }
        return this.loadFeatures();
    }

    getPlans(): Observable<IPricingPlan[]> {
        if (this.plans.length > 0) {
            return of(this.plans);
        }
        return this.loadPlans();
    }

    getPlanById(planId: string): Observable<IPricingPlan | undefined> {
        return this.getPlans().pipe(
            map(plans => plans.find(plan => plan.id === planId))
        );
    }

    getFeatureByKey(key: string): Observable<IFeature | undefined> {
        return this.getFeatures().pipe(
            map(features => features.find(feature => feature.key === key))
        );
    }

    @InvalidateCache({
        methods: ['PricingPlanService.loadFeatures'],
        groups: ['pricing-plans']
    })
    refreshFeatures(): Observable<IFeature[]> {
        this.features = [];
        return this.loadFeatures();
    }

    @InvalidateCache({
        methods: ['PricingPlanService.loadPlans'],
        groups: ['pricing-plans']
    })
    refreshPlans(): Observable<IPricingPlan[]> {
        this.plans = [];
        return this.loadPlans();
    }

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