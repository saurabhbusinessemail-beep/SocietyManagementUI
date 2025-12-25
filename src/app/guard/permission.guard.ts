import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionGuard implements CanActivate {

    constructor(
        private loginService: LoginService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const requiredPermission = route.data['permission'] as string;
        if (!requiredPermission) return true;
        
        const withId = route.data['withId'] as (string | undefined);
        const routeParamId = route.paramMap.get(withId ?? 'id');

        const hasPermission = this.loginService.hasPermission(requiredPermission, withId, routeParamId);
        if (!hasPermission)
            this.router.navigate(['/unauthorized']);

        return hasPermission;
    }
}
