import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { IAPISuccessUserMessage } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class PendingHttpService {
    private _snackBar = inject(MatSnackBar);
    durationInSeconds = 3;

    private pendingCount = new BehaviorSubject<number>(0);
    private pendingRequests = new Map<string, IAPISuccessUserMessage>();

    get pendingCount$(): Observable<number> {
        return this.pendingCount.asObservable();
    }

    getPendingCount(): number {
        return this.pendingCount.value;
    }

    addRequest(url: string, userMessage: IAPISuccessUserMessage): void {
        this.pendingRequests.set(url, userMessage);
        this.pendingCount.next(this.pendingRequests.size);
    }

    removeRequest(url: string, showUserMessage: boolean = true, overrideMessage?: string): void {
        const userMessage = this.pendingRequests.get(url);
        this.pendingRequests.delete(url);
        this.pendingCount.next(this.pendingRequests.size);
        if (showUserMessage && userMessage) {
            const messageToShow = overrideMessage || userMessage.message;
            this._snackBar.open(messageToShow, userMessage.action, { duration: this.durationInSeconds * 1000, panelClass: 'snackbar-success' });
        }
    }

    clear(): void {
        this.pendingRequests.clear();
        this.pendingCount.next(0);
    }
}