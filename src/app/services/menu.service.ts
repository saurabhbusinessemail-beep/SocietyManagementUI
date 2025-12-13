import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IMenu } from '../interfaces';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  userMenus = new BehaviorSubject<IMenu[]>([]);
  selectedMenu = new BehaviorSubject<IMenu | undefined>(undefined);

  constructor(private router: Router) { }

  selectAndLoadMenu(menu: IMenu) {
    this.selectedMenu.next(menu);
    this.router.navigateByUrl(menu.relativePath ?? '');
  }
}
