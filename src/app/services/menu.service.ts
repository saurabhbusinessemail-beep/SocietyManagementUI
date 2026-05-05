import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IMenu } from '../interfaces';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private _userMenus = new BehaviorSubject<IMenu[]>([]);

  userMenus = this._userMenus.asObservable();
  selectedMenu = new BehaviorSubject<IMenu | undefined>(undefined);

  private _filteredMenus = new BehaviorSubject<IMenu[]>([]);
  filteredMenus = this._filteredMenus.asObservable();

  dashboardMenu: IMenu = {
    _id: '',
    createdByUserId: '',
    createdOn: new Date(),
    menuId: 'dashboard',
    menuName: 'Dashboard',
    icon: 'dashboard',
    relativePath: '/dashboard/user',
  }

  get pageTitle(): string {
    return this.selectedMenu.value?.menuName ?? ''
  }

  get userMenusValue(): IMenu[] {
    return this._userMenus.value;
  }

  get filteredMenusValue(): IMenu[] {
    return this._filteredMenus.value;
  }

  constructor(private router: Router) { }

  setMenus(menus: IMenu[]) {
    const allMenus: IMenu[] = [
      this.dashboardMenu,
      ...menus,
    ];
    console.log('allMenus = ', allMenus)
    this._userMenus.next(allMenus);
  }

  setFilteredMenus(menus: IMenu[]) {
    this._filteredMenus.next(menus);
  }

  selectAndLoadMenu(menu: IMenu) {
    console.log('selectAndLoadMenu')
    this.selectedMenu.next(menu);
    this.router.navigateByUrl(menu.relativePath ?? '');
  }

  clearMenu() {
    this.selectedMenu.next(undefined);
    this._userMenus.next([]);
  }

  syncSelectedMenuWithCurrentUrl(skipCurrentUrlMatch = false) {
    const currentUrl = this.router.url.split('?')[0];
    console.log('currentUrl = ', this.router.url)

    const menus = this._userMenus.value;

    const matchedMenu =
      menus.find(m => currentUrl.indexOf((m.relativePath?.split('/')[1]) ?? ' ') === 1)

    if (matchedMenu && !skipCurrentUrlMatch) {
      this.selectedMenu.next(matchedMenu);
      // } else if (menus.length > 1) {
      //   this.selectAndLoadMenu(menus[1]);
    } else if (menus.length > 0) {
      this.selectAndLoadMenu(menus[0]);
    }
  }
}
