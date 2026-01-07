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

  get pageTitle(): string {
    return this.selectedMenu.value?.menuName ?? ''
  }

  constructor(private router: Router) { }

  selectAndLoadMenu(menu: IMenu) {
    this.selectedMenu.next(menu);
    this.router.navigateByUrl(menu.relativePath ?? '');
  }

  syncSelectedMenuWithCurrentUrl(skipCurrentUrlMatch = false) {
    const currentUrl = this.router.url.split('?')[0];
    console.log('currentUrl = ', this.router.url)

    const menus = this.userMenus.value;

    const matchedMenu =
      menus.find(m => currentUrl.indexOf((m.relativePath?.split('/')[1]) ?? ' ') === 1)

    if (matchedMenu && !skipCurrentUrlMatch) {
      this.selectedMenu.next(matchedMenu);
    } else if (menus.length > 1) {
      this.selectAndLoadMenu(menus[1]);
    } else if (menus.length > 0) {
      this.selectAndLoadMenu(menus[0]);
    }
  }
}
