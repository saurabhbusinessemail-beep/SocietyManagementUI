import { Component, OnInit } from '@angular/core';
import { MenuService } from './services/menu.service';
import { filter, take } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { LoginService } from './services/login.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserNameInputPopupComponent } from './core/user-name-popup/user-name-input-popup.component';
import { UserService } from './core/ui/user-search/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  show = false;
  title = 'SocietyManagementUI';
  dialogRef?: MatDialogRef<UserNameInputPopupComponent, any>

  constructor(
    private router: Router,
    private menuService: MenuService,
    private loginService: LoginService,
    private dialog: MatDialog,
    private userService: UserService
  ) { }

  ngOnInit(): void {

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {

        this.menuService.userMenus//.pipe(take(1))
          .subscribe(res => {
            this.menuService.syncSelectedMenuWithCurrentUrl();
            this.checkAndAskForUserName();
          });
      })

    setTimeout(() => {
      if (this.router.url === '/dashboard/user')
        this.menuService.syncSelectedMenuWithCurrentUrl(true);
    }, 100);
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

            this.userService.updateUserName(userName)
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
}
