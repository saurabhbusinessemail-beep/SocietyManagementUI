import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MenuService } from './services/menu.service';
import { filter, map, mergeMap, of, take } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { LoginService } from './services/login.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserNameInputPopupComponent } from './core/user-name-popup/user-name-input-popup.component';
import { FcmTokenService } from './services/fcm-token.service';
import { ConsoleCaptureService } from './services/console-capture.service';
import { PushNotificationService } from './services/push-notification.service';
import { ColdStartService } from './services/cold-start.service';
import { App } from '@capacitor/app';
import { UserService } from './services/user.service';
import { PricingPlanService } from './services/pricing-plan.service';
import { SocietyService } from './services/society.service';
import { ICurrentPlanResponse } from './interfaces';
import { IconsService } from './core/icons/icons.service';
import { CurrencyService } from './services/currency.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  private currencyService = inject(CurrencyService);

  firstRouteLoad = true;
  show = false;
  title = 'SocietyManagementUI';
  dialogRef?: MatDialogRef<UserNameInputPopupComponent, any>;

  societyPricingPlans: { [societyId: string]: ICurrentPlanResponse } = {};

  constructor(
    private router: Router,
    private menuService: MenuService,
    private loginService: LoginService,
    private dialog: MatDialog,
    private userService: UserService,
    private FcmTokenService: FcmTokenService,
    public consoleService: ConsoleCaptureService,
    private pushNotificationService: PushNotificationService,
    private coldStartService: ColdStartService,
    private pricingPlanService: PricingPlanService,
    private societService: SocietyService,
    private iconService: IconsService
  ) { }

  async ngOnInit() {

    this.currencyService.loadExchangeRate();

    await this.FcmTokenService.init();
    await this.pushNotificationService.initialize();

    this.loginService.loggedInUser.pipe(filter(val => !!val))
      .subscribe(() => this.checkAndAskForUserName());

    this.menuService.userMenus.subscribe(() => this.filterMenus());

    this.societService.selectedSocietyFilter
      .pipe(mergeMap(selectedSociety => {
        if (selectedSociety)
          return this.getSocietyPricingPlan(selectedSociety?.value)
        return of([]);
      }))
      .subscribe(() => this.filterMenus());

    // this.router.events
    //   .pipe(
    //     filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    //   )
    //   .subscribe((event: NavigationEnd) => {

    // this.menuService._userMenus//.pipe(take(1))
    //   .subscribe(res => {
    //     this.checkAndAskForUserName();

    // // No sync with URL change for some URLs
    // const excludeURLs = ['/profile'];
    // if (excludeURLs.includes(this.router.url)) {
    //   this.menuService.selectedMenu.next(undefined);
    //   return;
    // }

    // if (this.firstRouteLoad && res.length > 0 && this.router.url === '/dashboard/user') {
    //   this.menuService.syncSelectedMenuWithCurrentUrl(true);
    //   this.firstRouteLoad = false;
    // }
    // else
    //   this.menuService.syncSelectedMenuWithCurrentUrl();
    // });
    // })

    setTimeout(() => {
      if (this.router.url === '/dashboard/user')
        this.menuService.syncSelectedMenuWithCurrentUrl(true);

      console.log('Refreshing')
      this.pricingPlanService.refreshFeatures().pipe(take(1)).subscribe();
      this.pricingPlanService.refreshPlans().pipe(take(1)).subscribe();
    }, 100);

    // Listen for app resume events
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('App state changed. Active:', isActive);
      if (isActive) {
        // App came to foreground, check for pending notifications
        this.checkPendingNotifications();
      }
    });
  }

  private checkPendingNotifications() {
    // Check if there's a pending notification in storage
    const pending = localStorage.getItem('pending_notification');
    if (pending) {
      try {
        const notification = JSON.parse(pending);
        this.pushNotificationService.triggerNotificationManually(notification);
        localStorage.removeItem('pending_notification');
      } catch (error) {
        console.error('Error handling pending notification:', error);
      }
    }
  }

  checkAndAskForUserName() {
    setTimeout(() => {
      const user = this.loginService.getProfileFromStorage()?.user;

      if (this.loginService.isLoggedIn() && user && !user.name && !this.dialogRef) {
        this.dialogRef = this.dialog.open(UserNameInputPopupComponent);

        this.dialogRef.afterClosed()
          .pipe(take(1))
          .subscribe((userName: string | any) => {
            this.dialogRef = undefined;
            if (!userName || typeof userName !== 'string') return;

            this.userService.updateMyUserName(userName)
              .pipe(take(1))
              .subscribe(response => {
                if (!response.success) return;

                this.updateUserToken(response.token);
              })
          })
      }

    }, 1000);
  }

  updateUserToken(token: string) {
    this.loginService.saveTokenToStorage(token);
    this.loginService.loadProfile()
      .pipe(take(1))
      .subscribe((response: any) => {

        if (!response || !response.success) {
          return;
        }

      })
  }

  ngOnDestroy() {
    // Clean up listeners when app is destroyed
    this.pushNotificationService.removeAllListeners();
  }

  getSocietyPricingPlan(societyId: string) {
    return this.pricingPlanService.getCurrentPlan(societyId).pipe(
      map(response => {
        this.societyPricingPlans[societyId] = response;
      }),
      take(1)
    )
  }

  filterMenus() {
    const selectedSociety = this.societService.selectedSocietyFilterValue;
    const allMenus = this.menuService.userMenusValue;
    const selectedPricingPlan = selectedSociety ? this.societyPricingPlans[selectedSociety.value] : undefined;

    const filteredMenus = allMenus.filter(menu => {
      if (menu.mandatorFeatureAccess) { // menu that needs society level access
        if (!selectedPricingPlan) return false; // if no society is selected then no need to menus that need society level access

        // update logic to check pricing plan and menu
        return selectedPricingPlan.features?.some(f => f.key === menu.mandatorFeatureAccess && f.included);

      } else {
        return true;
      }
    });

    this.menuService.setFilteredMenus(filteredMenus);
  }
}
