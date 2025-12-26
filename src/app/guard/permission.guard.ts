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
        
        const checkSocietyId = route.data['checkSocietyId'] as (string | undefined);
        const routeParamId = route.paramMap.get('id');

        const hasPermission = this.loginService.hasPermission(requiredPermission, routeParamId ?? undefined);
        if (!hasPermission)
            this.router.navigate(['/unauthorized']);

        return hasPermission;
    }
}
