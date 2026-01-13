import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {

        const token = localStorage.getItem('auth_token');
        const fcmToken = localStorage.getItem('fcmToken');

        if (!token) {
            return next.handle(req);
        }

        let headers = req.headers
            .set('Authorization', `Bearer ${token}`);

        if (fcmToken) {
            headers = headers.set('fcmToken', fcmToken);
        }

        const authReq = req.clone({ headers });

        return next.handle(authReq);
    }
}
