import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IconModule } from './core/icons/icon.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthTokenInterceptor } from './interceptors/auth-token.interceptor';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { UserNamePopupModule } from './core/user-name-popup/user-name-popup.module';
import { PendingHttpInterceptor } from './interceptors/pending-http.interceptor';
import { ApiTrackerService } from './services/api-tracker.service';
import { environment } from '../environments/environment';
import { ApiTrackerInterceptor } from './interceptors/api-tracker.interceptor';

export function initTracker(tracker: ApiTrackerService) {
  return () => {
    // service instantiates here
    tracker.setConfig({
      trackUrls: [environment.apiBaseUrl],
      maxEntries: 100
    });
  };
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    IconModule,
    UserNamePopupModule
  ],
  providers: [
    provideAnimationsAsync(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PendingHttpInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initTracker,
      deps: [ApiTrackerService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiTrackerInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
