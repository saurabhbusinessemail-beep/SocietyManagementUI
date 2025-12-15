import { isDevMode } from '@angular/core';
import { Capacitor } from '@capacitor/core';

export class PlatformUtil {

  static isLocalhost(): boolean {
    return (
      isDevMode() &&
      (location.hostname === 'localhost' ||
       location.hostname === '127.0.0.1')
    );
  }

  static isNativeMobile(): boolean {
    return Capacitor.isNativePlatform();
  }
}
