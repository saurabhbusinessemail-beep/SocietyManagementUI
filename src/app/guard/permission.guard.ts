import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MenuService } from '../services/menu.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

    constructor(
        private menuService: MenuService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const requiredPermission = route.data['permission'] as string;

        if (!requiredPermission) {
            return true;
        }

        if (this.menuService.hasPermission(requiredPermission)) {
            return true;
        }

        // optional: redirect to list or no-access page
        this.router.navigate(['/unauthorized']);
        return false;
    }
}
