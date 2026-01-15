import { Injectable, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Router } from '@angular/router';
import { Platform } from '@angular/cdk/platform';

@Injectable({
    providedIn: 'root'
})
export class PushNotificationService {
    private isInitialized = false;

    constructor(
        private router: Router,
        private ngZone: NgZone,
        private platform: Platform
    ) { }

    async initialize() {
        // Only initialize once
        if (this.isInitialized) {
            return;
        }

        // Check if running on a device with push support
        if (!Capacitor.isNativePlatform()) {
            console.log('Push notifications only work on native platforms');
            return;
        }

        try {
            // Request permission for push notifications
            const permission = await PushNotifications.requestPermissions();
            if (permission.receive === 'granted') {
                // Register for push notifications
                await PushNotifications.register();
                this.setupListeners();
                this.isInitialized = true;
                console.log('Push notifications initialized');
            } else {
                console.log('User denied push notification permission');
            }
        } catch (error) {
            console.error('Error initializing push notifications:', error);
        }
    }

    private setupListeners() {
        // On successful registration, we can get the token
        PushNotifications.addListener('registration', (token: Token) => {
            console.log('Push registration success, token:', token.value);
            // Send this token to your backend server
            this.sendTokenToServer(token.value);
        });

        // Handle registration errors
        PushNotifications.addListener('registrationError', (error: any) => {
            console.error('Push registration error:', error);
        });

        // Handle notifications when app is FOREGROUND
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
            console.log('Push received (foreground):', notification);
            // You can show a custom notification UI here if needed
        });

        // Handle notification clicks - THIS IS WHAT YOU NEED
        PushNotifications.addListener('pushNotificationActionPerformed', async (action: ActionPerformed) => {
            console.log('Push action performed:', action);

            // Run in Angular zone to ensure change detection
            this.ngZone.run(() => {
                this.handleNotificationClick(action.notification);
            });
        });
    }

    private handleNotificationClick(notification: PushNotificationSchema) {
        console.log('Handling notification click:', notification);

        // Extract data from notification
        const data = notification.data || {};
        const notificationId = data.notificationId;
        const type = data.type;
        const gateEntryId = data.gateEntryId;

        // Log the data for debugging
        console.log('Notification data:', {
            notificationId,
            type,
            gateEntryId,
            allData: data
        });

        // Navigate based on notification type
        if (type === 'GATE_PASS' && gateEntryId) {
            // Navigate to gate entry page
            this.router.navigate(['/visitors/list']);
        } else if (notificationId) {
            // Navigate to notifications page or specific notification
            this.router.navigate(['/notifications', notificationId]);
        } else {
            // Default navigation if no specific data
            this.router.navigate(['/home']);
        }
    }

    private sendTokenToServer(token: string) {
        // Implement your logic to send the token to your backend
        console.log('Sending FCM token to server:', token);
        // Example:
        // this.http.post('/api/save-fcm-token', { token }).subscribe();
    }

    // Clean up when service is destroyed
    async removeAllListeners() {
        await PushNotifications.removeAllListeners();
    }

    // Get current notification settings
    async getDeliveredNotifications() {
        const notificationList = await PushNotifications.getDeliveredNotifications();
        console.log('Delivered notifications:', notificationList);
        return notificationList;
    }

    // Remove delivered notifications
    async removeDeliveredNotifications() {
        await PushNotifications.removeAllDeliveredNotifications();
    }
}