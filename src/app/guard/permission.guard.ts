import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { MenuService } from '../services/menu.service';
import { Observable, filter, map, of, take, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

    constructor(
        private menuService: MenuService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        const requiredPermission = route.data['permission'] as string;
        if (!requiredPermission) return of(true);

        return this.menuService.userMenus.pipe(
            filter(menus => menus.length > 0),
            take(1),
            map((m) => {
                return true // this.menuService.hasPermission(requiredPermission)
            }),
            tap(hasAccess => {
                if (!hasAccess) {
                    this.router.navigate(['/unauthorized']);
                }
            })
        );
    }
}
