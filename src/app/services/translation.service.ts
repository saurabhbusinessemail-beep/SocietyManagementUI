import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'mr' | 'te' | 'ta' | 'gu' | 'ur' | 'kn' | 'or' | 'ml' | 'pa' | 'zh' | 'es' | 'fr' | 'ar' | 'ru' | 'pt';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly STORAGE_KEY = 'gms_lang';
  private readonly DEFAULT_LANG: SupportedLanguage = 'en';

  private currentLang$ = new BehaviorSubject<SupportedLanguage>(this.DEFAULT_LANG);

  readonly languages: LanguageOption[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
    { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
    { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
    { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
    { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
    { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
    { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
    { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
    { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
    { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
    { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
    { code: 'zh', label: 'Mandarin', nativeLabel: '中文' },
    { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
    { code: 'fr', label: 'French', nativeLabel: 'Français' },
    { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
    { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
    { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' }
  ];

  constructor(private translate: TranslateService) {}

  /**
   * Initialize the translation service.
   * Should be called once at app startup (APP_INITIALIZER or AppComponent.ngOnInit).
   */
  init(): void {
    this.translate.addLangs(['en', 'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'ur', 'kn', 'or', 'ml', 'pa', 'zh', 'es', 'fr', 'ar', 'ru', 'pt']);
    this.translate.setDefaultLang(this.DEFAULT_LANG);

    const savedLang = localStorage.getItem(this.STORAGE_KEY) as SupportedLanguage | null;
    const langToUse: SupportedLanguage =
      savedLang && this.translate.getLangs().includes(savedLang) ? savedLang : this.DEFAULT_LANG;

    this.translate.use(langToUse);
    this.currentLang$.next(langToUse);
  }

  /** Returns an observable that emits the current language code on every change. */
  get currentLanguage$(): Observable<SupportedLanguage> {
    return this.currentLang$.asObservable();
  }

  /** Synchronously returns the current language code. */
  get currentLanguage(): SupportedLanguage {
    return this.currentLang$.getValue();
  }

  /**
   * Switch the active language.
   * Persists the selection to localStorage.
   */
  setLanguage(lang: SupportedLanguage): void {
    if (!this.translate.getLangs().includes(lang)) {
      console.warn(`[TranslationService] Language '${lang}' is not supported.`);
      return;
    }
    this.translate.use(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.currentLang$.next(lang);
  }

  /**
   * Synchronously translate a key (falls back to the key if not found).
   * Prefer the `translate` pipe in templates.
   */
  instant(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  /** Observable translation — use when the value must react to language changes in TS code. */
  get(key: string, params?: Record<string, unknown>): Observable<string> {
    return this.translate.get(key, params);
  }
}
