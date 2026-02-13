import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject, take, takeUntil } from 'rxjs';
import { UserNameInputPopupComponent } from '../../core/user-name-popup/user-name-input-popup.component';
import { IMyProfile, IUser } from '../../interfaces';
import { LoginService } from '../../services/login.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile?: IMyProfile;
  user: IUser | null = null;
  isLoading = false;
  error: string = '';
  private dialogRef: MatDialogRef<UserNameInputPopupComponent> | undefined;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private loginService: LoginService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profile = this.loginService.getProfileFromStorage();

    if (this.profile?.user) {
      this.user = this.profile.user;
      this.isLoading = false;
    } else {
      this.loginService.loadProfile()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response?.success) {
              this.profile = this.loginService.getProfileFromStorage();
              this.user = this.profile?.user || null;
            }
            this.isLoading = false;
          },
          error: (error) => {
            this.error = 'Failed to load profile';
            this.isLoading = false;
            console.error('Error loading profile:', error);
          }
        });
    }
  }

  openEditNameDialog(): void {
    if (!this.user || this.dialogRef) return;

    this.dialogRef = this.dialog.open(UserNameInputPopupComponent, {
      data: { userName: this.user.name }
    });

    this.dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe((userName: string | any) => {
        this.dialogRef = undefined;
        if (!userName || typeof userName !== 'string') return;

        this.updateUserName(userName);
      });
  }

  private updateUserName(userName: string): void {
    this.userService.updateMyUserName(userName)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          if (!response.success) return;

          this.updateUserToken(response.token);
        },
        error: (error) => {
          console.error('Error updating name:', error);
        }
      });
  }

  private updateUserToken(token: string): void {
    this.loginService.saveTokenToStorage(token);
    this.loginService.loadProfile()
      .pipe(take(1))
      .subscribe((response: any) => {
        if (!response || !response.success) {
          return;
        }

        // Update local user data
        this.profile = this.loginService.getProfileFromStorage();
        this.user = this.profile?.user || null;
      });
  }

  getInitial(): string {
    return this.user?.name?.charAt(0) || this.user?.email?.charAt(0) || 'U';
  }

  getStatusClass(): string {
    return `status-${this.user?.status || 'inactive'}`;
  }
}