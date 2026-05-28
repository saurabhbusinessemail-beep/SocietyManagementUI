import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IconModule } from './core/icons/icon.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AuthTokenInterceptor } from './interceptors/auth-token.interceptor';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';
import { UserNamePopupModule } from './core/user-name-popup/user-name-popup.module';
import { PendingHttpInterceptor } from './interceptors/pending-http.interceptor';
import { ApiTrackerService } from './services/api-tracker.service';
import { environment } from '../environments/environment';
import { ApiTrackerInterceptor } from './interceptors/api-tracker.interceptor';
import { SelectionListPopupModule } from './core/selection-list-popup/selection-list-popup.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// ─── i18n ────────────────────────────────────────────────────────────────────
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { TranslationService } from './services/translation.service';

export function createTranslateLoader(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function initTracker(tracker: ApiTrackerService) {
  return () => {
    // service instantiates here
    tracker.setConfig({
      trackUrls: [environment.apiBaseUrl],
      maxEntries: 100
    });
  };
}

export function initTranslation(translationService: TranslationService) {
  return () => translationService.init();
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    IconModule,
    UserNamePopupModule,
    SelectionListPopupModule,
    MatSnackBarModule,
    // ─── TranslateModule (root — forRoot) ─────────────────────────────────
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
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
    },
    // ─── Initialize translation (load saved language from localStorage) ───
    {
      provide: APP_INITIALIZER,
      useFactory: initTranslation,
      deps: [TranslationService],
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
