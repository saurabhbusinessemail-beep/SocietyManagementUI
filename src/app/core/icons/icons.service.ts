import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IconsService {
  private icons: Map<string, string> = new Map();

  constructor(private http: HttpClient) {
    this.preloadIcons();
  }

  private preloadIcons() {
    const iconList = [
      'abacus', 'account', 'account-circle', 'announcement', 'approve', 'arrow-down', 'arrow-left', 'block-icon',
      'calendar', 'call', 'clear', 'comment', 'complaint', 'dashboard', 'delete', 'double-arrow-right', 'down-arrow',
      'download', 'edit', 'exit', 'expire', 'filter', 'gateentry', 'gatepass', 'help', 'home', 'invalid',
      'location-color', 'logout-icon', 'member', 'menu-icon', 'more-vert', 'pin', 'publish', 'qr-code', 'reject',
      'search', 'security', 'setting', 'society-icon', 'tenant', 'user-icon', 'valid', 'visitor', '2W', '3W', '4W', '6W'
    ];

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
            // console.log('%cCompleted:', 'color:blue', icon);
          }
        });
    });
  }

  getIcon(name: string): Observable<string> {
    return new Observable(observer => {
      let retryCount = 0;
      const checkIcon = () => {
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

