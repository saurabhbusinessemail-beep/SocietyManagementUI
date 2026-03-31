import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cacheable, InvalidateCache } from '../decorators';
import { IBEResponseFormat } from '../interfaces';

// Define coupon interface based on your backend schema
export interface ICoupon {
    _id?: string;
    code: string;
    type: 'percentage' | 'fixed' | 'direct';
    value: number;
    planId: string | null;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Response for discount calculation
export interface IDiscountResult {
    discount: number;
    finalAmount: number;
    couponCode: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class CouponService {

    private readonly baseUrl = `${environment.apiBaseUrl}/coupons`;

    constructor(private http: HttpClient) { }

    // ------------------------------------------------------------------------
    // CREATE – invalidates all list caches
    // ------------------------------------------------------------------------
    @InvalidateCache({
        methods: [
            'CouponService.getCoupons*',      // invalidate all list variants
            'CouponService.getCouponByCode*'  // also invalidate any single coupon cache
        ],
        groups: ['coupons']
    })
    createCoupon(couponData: Partial<ICoupon>): Observable<IBEResponseFormat<ICoupon>> {
        return this.http.post<IBEResponseFormat<ICoupon>>(this.baseUrl, couponData);
    }

    // ------------------------------------------------------------------------
    // UPDATE – invalidates both the specific coupon and all lists
    // ------------------------------------------------------------------------
    @InvalidateCache({
        methods: [
            'CouponService.getCouponByCode',
            'CouponService.getCoupons*'
        ],
        matchParams: true,
        paramIndices: [0],        // first argument is coupon code
        groups: ['coupons']
    })
    updateCoupon(code: string, updateData: Partial<ICoupon>): Observable<IBEResponseFormat<ICoupon>> {
        return this.http.put<IBEResponseFormat<ICoupon>>(`${this.baseUrl}/${code}`, updateData);
    }

    // ------------------------------------------------------------------------
    // DELETE – invalidates specific coupon and all lists
    // ------------------------------------------------------------------------
    @InvalidateCache({
        methods: [
            'CouponService.getCouponByCode',
            'CouponService.getCoupons*'
        ],
        matchParams: true,
        paramIndices: [0],        // coupon code
        groups: ['coupons']
    })
    deleteCoupon(code: string): Observable<IBEResponseFormat<ICoupon>> {
        return this.http.delete<IBEResponseFormat<ICoupon>>(`${this.baseUrl}/${code}`);
    }

    // ------------------------------------------------------------------------
    // GET SINGLE COUPON BY CODE – cacheable
    // ------------------------------------------------------------------------
    @Cacheable({
        paramIndices: [0],        // cache key = method name + code
        group: 'coupons'
        // ttl can be added if needed, e.g. ttl: 300000
    })
    getCouponByCode(code: string): Observable<IBEResponseFormat<ICoupon>> {
        return this.http.get<IBEResponseFormat<ICoupon>>(`${this.baseUrl}/${code}`);
    }

    // ------------------------------------------------------------------------
    // LIST COUPONS – cacheable with filters (isActive, planId)
    // ------------------------------------------------------------------------
    @Cacheable({
        paramIndices: [0, 1],     // isActive, planId
        // Custom key generator to handle optional/null filters
        keyGenerator: (methodName: string, args: any[]) => {
            const [isActive, planId] = args;
            const filters: any = {};
            if (isActive !== undefined && isActive !== null) filters.isActive = isActive;
            if (planId) filters.planId = planId;
            return `${methodName}_${JSON.stringify(filters)}`;
        },
        group: 'coupons'
    })
    getCoupons(isActive?: boolean, planId?: string | null): Observable<IBEResponseFormat<ICoupon[]>> {
        let params: any = {};
        if (isActive !== undefined && isActive !== null) params.isActive = isActive;
        if (planId) params.planId = planId;
        return this.http.get<IBEResponseFormat<ICoupon[]>>(this.baseUrl, { params });
    }

    calculateDiscount(couponCode: string, amount: number, planId?: string | null): Observable<IBEResponseFormat<IDiscountResult>> {
        return this.http.post<IBEResponseFormat<IDiscountResult>>(`${this.baseUrl}/calculate-discount`, {
            couponCode,
            amount,
            planId
        });
    }
}