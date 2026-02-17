import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IPagination, IVehicle } from '../interfaces';
import { PaginationService } from './pagination.service';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

@Injectable({
    providedIn: 'root'
})
export class VehicleService {
    private baseUrl = `${environment.apiBaseUrl}/vehicles`; // e.g., /api/vehicles

    constructor(private http: HttpClient, private paginationService: PaginationService) { }

    getVehicles(flatId: string, options: IPagination = {}): Observable<ApiResponse<IVehicle[]>> {
        let params = this.paginationService.createPaginationParams(options);

        return this.http.post<ApiResponse<IVehicle[]>>(`${this.baseUrl}/${flatId}`, null, { params })
    }

    createVehicle(flatId: string, data: Partial<IVehicle>): Observable<ApiResponse<IVehicle>> {
        return this.http.post<ApiResponse<IVehicle>>(`${this.baseUrl}/${flatId}/add`, data)
    }

    deleteVehicle(vehicleId: string): Observable<ApiResponse<null>> {
        return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${vehicleId}`)
    }
}