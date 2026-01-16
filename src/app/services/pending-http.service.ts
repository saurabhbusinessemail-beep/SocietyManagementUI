import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PendingHttpService {
    private pendingCount = new BehaviorSubject<number>(0);
    private pendingRequests = new Set<string>();

    get pendingCount$(): Observable<number> {
        return this.pendingCount.asObservable();
    }

    getPendingCount(): number {
        return this.pendingCount.value;
    }

    addRequest(url: string): void {
        this.pendingRequests.add(url);
        this.pendingCount.next(this.pendingRequests.size);
    }

    removeRequest(url: string): void {
        this.pendingRequests.delete(url);
        this.pendingCount.next(this.pendingRequests.size);
    }

    clear(): void {
        this.pendingRequests.clear();
        this.pendingCount.next(0);
    }
}