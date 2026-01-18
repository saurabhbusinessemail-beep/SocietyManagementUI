import { Injectable, NgZone, ApplicationRef } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Router } from '@angular/router';
import { Platform } from '@angular/cdk/platform';
import { App } from '@capacitor/app';
import { GateEntryService } from './gate-entry.service';
import { fireBase } from '../constants';
import { FirebaseOptions, initializeApp } from 'firebase/app';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

@Injectable({
    providedIn: 'root'
})
export class PushNotificationService {
    private isInitialized = false;
    private firebaseConfig: FirebaseOptions = fireBase;

    constructor(
        private router: Router,
        private ngZone: NgZone,
        private platform: Platform,
        private appRef: ApplicationRef,
        private gateEntryService: GateEntryService
    ) {
        // Check for launch notification when app starts
        this.checkLaunchNotification();
    }

    async initialize() {
        if (this.isInitialized) {
            return;
        }

        if (!Capacitor.isNativePlatform()) {
            // console.log('Push notifications only work on native platforms');
            this.initializeWeb();
            return;
        }

        try {
            const permission = await PushNotifications.requestPermissions();
            if (permission.receive === 'granted') {
                await PushNotifications.register();
                this.setupCapacitorListeners();
                this.isInitialized = true;
                console.log('Push notifications initialized');
            } else {
                console.log('User denied push notification permission');
            }
        } catch (error) {
            console.error('Error initializing push notifications:', error);
        }
    }

    private setupCapacitorListeners() {
        // On successful registration
        PushNotifications.addListener('registration', (token: Token) => {
            console.log('Push registration success, token:', token.value);
            this.sendTokenToServer(token.value);
        });

        // Handle registration errors
        PushNotifications.addListener('registrationError', (error: any) => {
            console.error('Push registration error:', error);
        });

        // Handle notifications when app is FOREGROUND
        PushNotifications.addListener('pushNotificationReceived',
            (notification: PushNotificationSchema) => {
                console.log('Push received (foreground):', notification);
                this.showInAppNotification(notification);
            }
        );

        // Handle notification clicks when app is BACKGROUND or CLOSED
        PushNotifications.addListener('pushNotificationActionPerformed',
            (action: ActionPerformed) => {
                console.log('Push action performed:', action);
                this.handleNotification(action.notification);
            }
        );
    }

    private async checkLaunchNotification() {
        // Check if app was launched from a notification
        if (Capacitor.isNativePlatform()) {
            const launchInfo = await App.getLaunchUrl();
            console.log('App launch info:', launchInfo);

            // Check local storage for pending notification from Android
            const pendingNotification = localStorage.getItem('pending_notification');
            if (pendingNotification) {
                try {
                    const notification = JSON.parse(pendingNotification);
                    setTimeout(() => {
                        this.handleNotification(notification);
                    }, 1000); // Small delay to ensure app is ready
                    localStorage.removeItem('pending_notification');
                } catch (error) {
                    console.error('Error processing pending notification:', error);
                }
            }
        }
    }

    private handleNotification(notification: PushNotificationSchema) {
        this.ngZone.run(() => {
            console.log('Handling notification click:', notification);

            const data = notification.data || {};
            const notificationId = data.notificationId;
            const type = data.type;
            const gateEntryId = data.gateEntryId;

            console.log('Notification data:', {
                notificationId,
                type,
                gateEntryId,
                allData: data
            });

            // Navigate based on notification type
            if (type === 'GATE_PASS' && gateEntryId) {
                setTimeout(() => {
                    this.gateEntryService.handleApprovalNotificationRequest(gateEntryId)
                }, 100);
            } else if (type === 'GATE_PASS_RESPONSE' && gateEntryId) {
                setTimeout(() => {
                    this.gateEntryService.handleApprovalNotificationResponse(gateEntryId)
                }, 100);
            } else if (notificationId) {
                this.router.navigate(['/notifications', notificationId]);
            } else {
                this.router.navigate(['/home']);
            }

            // Force change detection
            this.appRef.tick();
        });
    }

    private showInAppNotification(notification: PushNotificationSchema) {
        console.log('Show in-app notification:', notification);
        this.handleNotification(notification);
        // Show a toast or banner in your app
    }

    private sendTokenToServer(token: string) {
        console.log('Sending FCM token to server:', token);
        // Send to your backend
        // Example: this.apiService.sendFcmToken(token).subscribe();
    }

    // Method to manually trigger notification handling (for testing)
    triggerNotificationManually(data: any) {
        const notification: PushNotificationSchema = {
            title: data.title,
            body: data.body,
            data: data.data || {},
            id: Date.now().toString()
        };
        this.handleNotification(notification);
    }

    async removeAllListeners() {
        await PushNotifications.removeAllListeners();
    }


    /* For Web Browser */
    private async initializeWeb() {
        try {
            // Initialize Firebase for web
            const app = initializeApp(this.firebaseConfig);

            // Request permission
            if (Notification.permission === 'default') {
                await Notification.requestPermission();
            }

            // Get FCM token via Capacitor Firebase Messaging
            const result = await FirebaseMessaging.getToken();
            const token = result.token;

            console.log('Web FCM Token:', token);

            // Send token to backend
            this.sendTokenToServer(token);

            // Setup foreground listener for web
            this.setupWebForegroundListener(app);

            // Also setup Capacitor listeners (they work on web too)
            this.setupCapacitorListeners();

        } catch (error) {
            console.error('Web notification initialization failed:', error);
        }
    }

    private setupWebForegroundListener(app: any) {
        // Additional foreground listener for web using Firebase SDK
        // This ensures we catch all foreground messages on web

        // if (this.isWebPlatform) {
        try {
            import('firebase/messaging').then(({ getMessaging, onMessage }) => {
                const messaging = getMessaging(app);

                onMessage(messaging, (payload) => {
                    console.log('Web foreground message via Firebase:', payload);

                    // this.ngZone.run(() => {
                    //     // Convert Firebase payload to Capacitor format
                    //     const notification: PushNotificationSchema = {
                    //         title: payload.notification?.title || payload.data?.title,
                    //         body: payload.notification?.body || payload.data?.body,
                    //         data: payload.data || {}
                    //     };

                    //     this.showInAppNotification(notification);
                    // });
                });
            });
        } catch (error) {
            console.log('Firebase onMessage setup skipped:', error);
        }
        // }
    }
}