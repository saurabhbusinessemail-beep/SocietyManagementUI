import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface AppTheme {
  id: string;
  name: string;
  colorPrimary: string;
  colorSecondary: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  public availableThemes: AppTheme[] = [
    { id: 'default', name: 'Indigo', colorPrimary: '#312e81', colorSecondary: '#e0e7ff' },
    { id: 'dark', name: 'Dark', colorPrimary: '#0f172a', colorSecondary: '#1e293b' },
    { id: 'ocean', name: 'Ocean', colorPrimary: '#0c4a6e', colorSecondary: '#0ea5e9' },
    { id: 'emerald', name: 'Emerald', colorPrimary: '#064e3b', colorSecondary: '#10b981' }
  ];

  public currentTheme = new BehaviorSubject<string>('default');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadSavedTheme();
    }
  }

  loadSavedTheme() {
    try {
      const savedTheme = localStorage.getItem('app-theme') || 'default';
      this.setTheme(savedTheme);
    } catch (e) {
      console.error('Failed to load theme', e);
    }
  }

  setTheme(themeId: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      if (themeId === 'default') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', themeId);
      }
      localStorage.setItem('app-theme', themeId);
      this.currentTheme.next(themeId);
    } catch (e) {
      console.error('Failed to set theme', e);
    }
  }
}
