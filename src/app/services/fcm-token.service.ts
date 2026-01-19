import { Injectable } from '@angular/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { DialogService } from './dialog.service';
import { NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class FcmTokenService {

    get fcmToken(): string | undefined {
        return localStorage.getItem('fcmToken') ?? undefined;
    }

    set fcmToken(token: string | undefined) {
        if (!token) localStorage.removeItem('fcmToken');
        else localStorage.setItem('fcmToken', token);
    }

    constructor(private dialogService: DialogService, private zone: NgZone) { }

    async init() {
        if (!Capacitor.isNativePlatform()) {
            console.log('Push notifications only work on native platforms');
            return;
        }
        
        const perm = await PushNotifications.requestPermissions();
        this.zone.run(() => {
            console.log("Notification permission = ", perm)
        });
        if (perm.receive !== 'granted') return;

        await PushNotifications.register();

        PushNotifications.addListener('registration', token => {
            this.fcmToken = token.value;

            // Delay + run inside Angular zone
            setTimeout(() => {
                this.zone.run(() => {
                    console.log('FCM Token:', this.fcmToken);
                });
            }, 10);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', action => {
            this.zone.run(() => {
                // navigation is OK here
                // this.router.navigate(...)
            });
        });
    }
}
