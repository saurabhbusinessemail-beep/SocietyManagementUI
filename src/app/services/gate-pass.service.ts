import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBEResponseFormat, IGatePass, IPagedResponse } from '../interfaces';
import { Cacheable, InvalidateCache } from '../decorators';

@Injectable({
    providedIn: 'root'
})
export class GatePassService {

    private baseUrl = `${environment.apiBaseUrl}/gatepass`;

    constructor(private http: HttpClient,) { }

    @InvalidateCache({
        methods: [
            'GatePassService.getGattePasses*',
            'GatePassService.validateGatePass*'
        ],
        groups: ['gatepasses']
    })
    newGatePass(payload: any): Observable<IBEResponseFormat> {
        return this.http.post<IBEResponseFormat>(this.baseUrl, payload);
    }

    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0, 1],
        paramKeys: {
            0: ['societyId'],
            1: ['flatId']
        },
        group: 'gatepasses',
        keyGenerator: (methodName: string, args: any[]) => {
            const [societyId, flatId] = args;
            const filters: any = {};
            if (societyId) filters.societyId = societyId;
            if (flatId) filters.flatId = flatId;
            return `${methodName}_${JSON.stringify(filters)}`;
        }
    })
    getGattePasses(societyId?: string, flatId?: string): Observable<IPagedResponse<IGatePass>> {
        const payload = { societyId, flatId };
        return this.http.post<IPagedResponse<IGatePass>>(`${this.baseUrl}/myGatePasses`, payload);
    }

    @InvalidateCache({
        methods: [
            'GatePassService.getGattePasses*',
            'GatePassService.validateGatePass*'
        ],
        groups: ['gatepasses']
    })
    deleteGatePass(gatePassId: string): Observable<IBEResponseFormat> {
        return this.http.delete<IBEResponseFormat>(`${this.baseUrl}/${gatePassId}`);
    }

    @Cacheable({
        // ttl: 60000, // 1 minute - OTP validation is time-sensitive
        paramIndices: [0, 1, 2],
        paramKeys: {
            0: ['otp'],
            1: ['societyId'],
            2: ['flatId']
        },
        group: 'gatepasses'
    })
    validateOTP(otp: string, societyId: string, flatId?: string): Observable<IBEResponseFormat<IGatePass>> {
        const payload = { otp, societyId, flatId };
        return this.http.post<IBEResponseFormat>(`${this.baseUrl}/validateOTP`, payload);
    }

    @Cacheable({
        // ttl: 300000, // 5 minutes
        paramIndices: [0],
        group: 'gatepasses'
    })
    validateGatePass(gatePassId: string): Observable<IBEResponseFormat<IGatePass>> {
        return this.http.get<IBEResponseFormat>(`${this.baseUrl}/validateGatePass/${gatePassId}`);
    }
}