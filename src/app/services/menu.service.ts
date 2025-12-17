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

  syncSelectedMenuWithCurrentUrl() {
    const currentUrl = this.router.url.split('?')[0];
    console.log('currentUrl = ', this.router.url)

    const menus = this.userMenus.value;

    const matchedMenu =
      menus.find(m => m.relativePath === currentUrl) ||
      menus.find(m =>
        m.submenus?.some(sm => sm.relativePath === currentUrl)
      );

    if (matchedMenu) {
      this.selectedMenu.next(matchedMenu);
    }
  }

  hasPermission(permission: string): boolean {
    const menus = this.userMenus.value;
    if (!menus?.length) {
      return false;
    }

    return menus.some(menu => menu.submenus.some(submenu =>
      submenu.permissions?.includes(permission)
    ));
  }
}
