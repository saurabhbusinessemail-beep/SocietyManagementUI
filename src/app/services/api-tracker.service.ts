import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ApiTrackerConfig {
    trackDomains?: string[];
    trackUrls?: string[];
    ignoreUrls?: string[];
    maxEntries?: number;
}

export interface ApiCallRecord {
    id: string;
    method: string;
    url: string;
    headers: any;
    requestPayload: any;
    responseBody: any;
    status: number;
    duration: number;
    timestamp: Date;
    error?: any;
}


@Injectable({
    providedIn: 'root'
})
export class ApiTrackerService {

    private config: ApiTrackerConfig = {
        trackDomains: [],
        trackUrls: [],
        ignoreUrls: [],
        maxEntries: 500
    };

    private calls: ApiCallRecord[] = [];
    private callsSubject = new BehaviorSubject<ApiCallRecord[]>([]);
    public calls$ = this.callsSubject.asObservable();

    constructor() {
        // Ensures service initializes on app bootstrap
        console.log('[ApiTracker] Started tracking...');
    }

    // --- CONFIGURATION ---

    setConfig(config: ApiTrackerConfig) {
        this.config = { ...this.config, ...config };
    }

    shouldTrack(url: string): boolean {

        if (this.config.ignoreUrls?.some(u => url.includes(u))) {
            return false;
        }

        if (this.config.trackUrls?.length) {
            return this.config.trackUrls.some(u => url.includes(u));
        }

        if (this.config.trackDomains?.length) {
            return this.config.trackDomains.some(domain =>
                url.includes(domain)
            );
        }

        return false;
    }

    // --- RECORD HANDLING ---

    addCall(record: ApiCallRecord) {

        this.calls.unshift(record);

        if (this.config.maxEntries && this.calls.length > this.config.maxEntries) {
            this.calls.pop();
        }

        this.callsSubject.next([...this.calls]);
    }

    clear() {
        this.calls = [];
        this.callsSubject.next([]);
    }

    getSnapshot(): ApiCallRecord[] {
        return [...this.calls];
    }
}
