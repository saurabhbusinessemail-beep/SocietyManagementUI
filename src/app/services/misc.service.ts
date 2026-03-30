import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { IBEResponseFormat, IUsageMetric } from "../interfaces";

@Injectable({
    providedIn: 'root'
})
export class MiscService {


    private baseUrl = `${environment.apiBaseUrl}/misc`;

    constructor(private http: HttpClient) { }

    getUsageMetric(): Observable<IBEResponseFormat<IUsageMetric>> {
        return this.http.get<IBEResponseFormat<IUsageMetric>>(`${this.baseUrl}/getUsageMetric`);
    }

}
