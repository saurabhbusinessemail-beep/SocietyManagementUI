// pricing-plan.service.ts - Add duration-related methods

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { IBEResponseFormat, IChangePlanCalculation, ICurrentPlanResponse, IFeature, IPagedResponse, IPlanHistoryItem, IPricingPlan, ISocietyPlan, IPlanDurationsResponse, IPaymentVerificationPayload } from '../interfaces';
import { Cacheable, InvalidateCache } from '../decorators';

@Injectable({
    providedIn: 'root'
})
export class PricingPlanService {
    private baseUrl = `${environment.apiBaseUrl}/pricing-plan`;
    private razorPayBaseURL = `${environment.apiBaseUrl}/payments`;

    features: IFeature[] = [];
    plans: IPricingPlan[] = [];

    constructor(private http: HttpClient) { }

    @Cacheable({
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

    getPlanDurations(planId: string, societyId?: string): Observable<IPlanDurationsResponse> {
        let url = `${this.baseUrl}/plans/${planId}/durations`;
        if (societyId) {
            url += `?societyId=${societyId}`;
        }
        return this.http.get<IPlanDurationsResponse>(url);
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

    // Updated purchase method with duration
    @InvalidateCache({
        methods: [
            'PricingPlanService.getCurrentPlan*',
            'PricingPlanService.getPlanHistory*'
        ],
        matchParams: true,
        paramIndices: [0],
        groups: ['pricing-plans']
    })
    purchasePlan(
        societyId: string,
        planId: string,
        durationValue: number,
        durationUnit: 'months' | 'years',
        startDate?: Date,
        couponCode?: string
    ): Observable<ISocietyPlan> {
        const payload: any = {
            planId,
            durationValue,
            durationUnit
        };
        if (startDate) {
            payload.startDate = startDate;
        }
        if (couponCode) {
            payload.couponCode = couponCode;
        }
        return this.http.post<ISocietyPlan>(
            `${this.baseUrl}/purchase/${societyId}`,
            payload
        );
    }

    @Cacheable({
        paramIndices: [0],
        group: 'pricing-plans'
    })
    getCurrentPlan(societyId: string): Observable<ICurrentPlanResponse> {
        return this.http.get<ICurrentPlanResponse>(`${this.baseUrl}/current-plan/${societyId}`);
    }

    @Cacheable({
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

    // Updated calculateChangePrice with duration
    calculateChangePrice(
        societyId: string,
        newPlanId: string,
        durationValue: number,
        durationUnit: 'months' | 'years',
        couponCode?: string
    ): Observable<IChangePlanCalculation> {
        const payload: any = {
            societyId,
            newPlanId,
            durationValue,
            durationUnit
        };
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
        paramIndices: [0],
        groups: ['pricing-plans']
    })
    changePlan(
        societyId: string,
        newPlanId: string,
        durationValue: number,
        durationUnit: 'months' | 'years',
        paymentMethod?: string,
        paymentDetails?: any,
        couponCode?: string
    ): Observable<any> {
        const payload: any = {
            newPlanId,
            durationValue,
            durationUnit,
            paymentMethod,
            paymentDetails
        };
        if (couponCode) {
            payload.couponCode = couponCode;
        }
        return this.http.post(`${this.baseUrl}/change/${societyId}`, payload);
    }

    @Cacheable({
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

    verifyPayment(payload: IPaymentVerificationPayload): Observable<IBEResponseFormat> {
        return this.http.post<IBEResponseFormat>(`${this.razorPayBaseURL}/verify`, payload);
    }
}