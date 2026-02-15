import { Injectable } from "@angular/core";
import { IPagination } from "../interfaces";
import { HttpParams } from "@angular/common/http";



@Injectable({
    providedIn: 'root'
})
export class PaginationService {

    createPaginationParams(options: IPagination, params?: HttpParams) {
        if (!params) params = new HttpParams();

        if (options.page) params = params.set('page', options.page.toString());
        if (options.limit) params = params.set('limit', options.limit.toString());

        return params;
    }
}