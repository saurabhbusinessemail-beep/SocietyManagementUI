import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorDialogService } from '../services/error-dialog.service';


@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {


    constructor(private errorDialogService: ErrorDialogService) { }


    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                console.log(error)
                let title = 'Unexpected Error';
                let message = 'Something went wrong. Please try again.';


                if (error.error?.message) {
                    message = error.error.message;
                } else if (error.message) {
                    message = error.message;
                }


                if (error.status === 0) {
                    title = 'Network Error';
                    message = 'Unable to connect to server.';
                } else if (error.status === 401) {
                    title = 'Unauthorized';
                } else if (error.status === 403) {
                    title = 'Forbidden';
                } else if (error.status === 404) {
                    title = 'Not Found';
                } else if (error.status >= 500) {
                    title = 'Server Error';
                }


                this.errorDialogService.open(title, message);


                return throwError(() => error);
            })
        );
    }
}