import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../../services/login.service';
import { IMenu, IMyProfile } from '../../../interfaces';
import { Location } from '@angular/common';
import { MenuService } from '../../../services/menu.service';
import { IconsService } from '../../../core/icons/icons.service';

@Component({
  selector: 'app-user-menu-page',
  templateUrl: './user-menu-page.component.html',
  styleUrls: ['./user-menu-page.component.scss']
})
export class UserMenuPageComponent {

  get myProfile(): IMyProfile | undefined {
    return this.loginService.getProfileFromStorage();
  }

  get filteredMenus() {
    return this.menuService.filteredMenusValue;
  }

  constructor(
    private loginService: LoginService,
    private router: Router,
    private location: Location,
    private menuService: MenuService,
    public iconService: IconsService
  ) { }

  closeMenu(): void {
    this.location.back(); // go back to previous page
  }

  onMenuClick(menu: IMenu) {
    if (menu.relativePath)
      this.router.navigateByUrl(menu.relativePath)
  }

  onRegisterSocietyClick(): void {
    this.router.navigateByUrl('/society-public/add');
    // Optionally close menu after navigation (the navigation will replace this page)
  }

  onDemoClick(): void {
    this.router.navigateByUrl('/demo/book');
  }

  onProfileClick(): void {
    this.router.navigateByUrl('/profile');
  }

  onHelpClick(): void {
    this.router.navigateByUrl('/help-support'); // adjust route as needed
  }

  logout(): void {
    this.loginService.logout();
    // After logout, navigate to login page (or wherever your app redirects)
    this.router.navigateByUrl('/login');
  }
}