import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {

    const isLoggedIn = this.loginService.isLoggedIn();
    const url = state.url;

    // 🔐 Logged in user
    if (isLoggedIn) {
      // ❌ Logged in user should NOT see login page
      if (url.startsWith('/login')) {
        return this.router.createUrlTree(['/dashboard']);
      }

      // ✅ Allow society, dashboard, other protected pages
      return true;
    }

    // 🔓 Not logged in user
    if (!isLoggedIn) {
      // ✅ Allow login page
      if (url.startsWith('/login')) {
        return true;
      }

      // ❌ Block protected pages
      return this.router.createUrlTree(['/login']);
    }

    return true;
  }
}

