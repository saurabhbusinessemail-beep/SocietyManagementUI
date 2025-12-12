import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IMenu } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  userMenus = new BehaviorSubject<IMenu[]>([]);

  constructor() { }
}
