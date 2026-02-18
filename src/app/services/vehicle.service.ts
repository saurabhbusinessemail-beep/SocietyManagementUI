import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { IBEResponseFormat, IPagination, IVehicle } from '../interfaces';
import { PaginationService } from './pagination.service';


@Injectable({
    providedIn: 'root'
})
export class VehicleService {
    private baseUrl = `${environment.apiBaseUrl}/vehicle`; // e.g., /api/vehicles

    constructor(private http: HttpClient, private paginationService: PaginationService) { }

    getVehicles(flatId: string, options: IPagination = {}): Observable<IBEResponseFormat<IVehicle[]>> {
        let params = this.paginationService.createPaginationParams(options);

        return this.http.post<IBEResponseFormat<IVehicle[]>>(`${this.baseUrl}/${flatId}/get`, null, { params })
    }

    createVehicle(flatId: string, data: any): Observable<IBEResponseFormat<IVehicle>> {
        return this.http.post<IBEResponseFormat<IVehicle>>(`${this.baseUrl}/${flatId}/add`, data)
    }

    deleteVehicle(vehicleId: string): Observable<IBEResponseFormat<null>> {
        return this.http.delete<IBEResponseFormat<null>>(`${this.baseUrl}/${vehicleId}`)
    }
}