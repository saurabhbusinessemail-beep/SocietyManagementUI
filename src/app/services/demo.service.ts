import { Injectable } from '@angular/core';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DemoService {

    bookDemo(payload: any) {
        return of(payload);
    }
}