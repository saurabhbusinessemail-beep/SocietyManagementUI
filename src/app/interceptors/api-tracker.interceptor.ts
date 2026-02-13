import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiTrackerService, ApiCallRecord } from '../services/api-tracker.service';

@Injectable()
export class ApiTrackerInterceptor implements HttpInterceptor {

    constructor(private tracker: ApiTrackerService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (!this.tracker.shouldTrack(req.url)) {
            return next.handle(req);
        }

        const started = performance.now();
        const headers = this.extractHeaders(req.headers);

        return next.handle(req).pipe(
            tap({
                next: (event) => {
                    if (event instanceof HttpResponse) {
                        this.record(req, event.body, event.status, started, headers);
                    }
                },
                error: (error) => {
                    this.record(req, error.error, error.status, started, headers, error);
                }
            })
        );
    }

    private record(
        req: HttpRequest<any>,
        response: any,
        status: number,
        started: number,
        headers: any,
        error?: any
    ) {
        const duration = performance.now() - started;

        const record: ApiCallRecord = {
            id: crypto.randomUUID(),
            method: req.method,
            url: req.urlWithParams,
            headers,
            requestPayload: req.body,
            responseBody: response,
            status,
            duration,
            timestamp: new Date(),
            error
        };

        this.tracker.addCall(record);
    }

    private extractHeaders(headers: any) {
        const result: any = {};
        headers.keys().forEach((key: string) => {
            result[key] = headers.get(key);
        });
        return result;
    }
}
