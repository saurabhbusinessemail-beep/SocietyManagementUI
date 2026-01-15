import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class ColdStartService {
    private notificationData: any = null;

    constructor(private router: Router) {
        this.setupAppStateListeners();
    }

    private setupAppStateListeners() {
        if (Capacitor.isNativePlatform()) {
            // Listen for app state changes
            App.addListener('appStateChange', (state) => {
                if (state.isActive && this.notificationData) {
                    // App just became active and we have pending notification data
                    this.handlePendingNotification();
                }
            });

            // Listen for app launch
            App.addListener('appUrlOpen', (data) => {
                console.log('App opened with URL:', data);
                // You can parse URL or handle deep linking here
            });
        }
    }

    setNotificationData(data: any) {
        this.notificationData = data;
    }

    private handlePendingNotification() {
        if (this.notificationData) {
            // Use setTimeout to ensure Angular is fully initialized
            setTimeout(() => {
                // Navigate based on notification data
                this.routeBasedOnNotification(this.notificationData);
                this.notificationData = null;
            }, 1000);
        }
    }

    private routeBasedOnNotification(data: any) {
        const notificationId = data.notificationId;
        const type = data.type;
        const gateEntryId = data.gateEntryId;

        if (type === 'GATE_PASS' && gateEntryId) {
            this.router.navigate(['/gate-entries', gateEntryId]);
        } else if (notificationId) {
            this.router.navigate(['/notifications', notificationId]);
        }
    }
}