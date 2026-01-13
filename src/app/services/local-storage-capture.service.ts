import { Injectable, NgZone } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageCaptureService {

    constructor(private zone: NgZone) {
    }

    getLocalStorageData() {
        const data: { key: string, value: any }[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;

            const value = localStorage.getItem(key);

            // Try JSON parse, fallback to string
            try {
                data.push({ key, value: value ? JSON.parse(value) : value })
                //   data[key] = value ? JSON.parse(value) : value;
            } catch {
                data.push({ key, value });
                // data[key] = value;
            }
        }

        return data;
    }

    clearLocalStorage() {
        localStorage.clear();
    }

    removeStorage(key: string) {
        if (localStorage.getItem(key))
            localStorage.removeItem(key);
    }
}
