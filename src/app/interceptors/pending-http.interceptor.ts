// pending-http.interceptor.ts
import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PendingHttpService } from '../services/pending-http.service';

@Injectable()
export class PendingHttpInterceptor implements HttpInterceptor {

    constructor(private pendingHttpService: PendingHttpService) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const requestUrl = `${request.method}:${request.url}`;

        // Add to pending requests
        this.pendingHttpService.addRequest(requestUrl);

        return next.handle(request).pipe(
            tap({
                next: (event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse || event instanceof HttpErrorResponse) {
                        // Remove from pending requests on completion
                        this.pendingHttpService.removeRequest(requestUrl);
                    }
                },
                error: () => {
                    // Remove from pending requests on error
                    this.pendingHttpService.removeRequest(requestUrl);
                },
                complete: () => {
                    // Fallback removal in case of completion without response/error
                    if (this.pendingHttpService.getPendingCount() > 0) {
                        this.pendingHttpService.removeRequest(requestUrl);
                    }
                }
            })
        );
    }
}