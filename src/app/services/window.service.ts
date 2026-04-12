import { Injectable } from '@angular/core';
import { Mode } from '../types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class WindowService {
    mode = new BehaviorSubject<Mode>('desktop');

    evaluateMode() {
        const w = window.innerWidth;
        if (w >= 1200) { this.mode.next('desktop') }
        else if (w >= 480) { this.mode.next('tablet') } // icons only
        else { this.mode.next('mobile') }
    }
}