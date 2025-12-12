import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IconsService {
  private icons: Map<string, string> = new Map();

  constructor(private http: HttpClient) {
    this.preloadIcons();
  }

  private preloadIcons() {
    const iconList = ['menu-icon', 'logout-icon', 'arrow-down', 'block-icon', 'user-icon', 'arrow-left'];

    iconList.forEach((icon, index) => {
      this.http.get(`assets/icons/${icon}.svg`, { responseType: 'text' })
        .subscribe({
          next: svg => {
            this.icons.set(iconList[index], svg);
          },
          error: err => {
            console.error(`%cFailed to load icon: ${icon}`, 'color:red', err);
          },
          complete: () => {
            console.log('%cCompleted:', 'color:blue', icon);
          }
        });
    });
  }

  getIcon(name: string): Observable<string> {
    return new Observable(observer => {
      let retryCount = 0;
      const checkIcon = () => {
        console.log('checkIcon')
        const svg = this.icons.get(name);
        if (svg) {
          observer.next(svg);
          observer.complete();
        } else {
          retryCount++;
          if (retryCount < 10) setTimeout(checkIcon, 20); // Retry until icon is loaded
          else {
            observer.next(this.icons.get('block-icon') ?? '');
            observer.complete();
          }
        }
      };
      checkIcon();
    });
  }
}

