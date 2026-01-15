import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

// Check for pending notifications on cold start
if (Capacitor.isNativePlatform()) {
  // This runs before Angular initializes
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    // Store the notification data in localStorage for cold start
    localStorage.setItem('pendingNotification', JSON.stringify(action.notification.data));
  });
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
