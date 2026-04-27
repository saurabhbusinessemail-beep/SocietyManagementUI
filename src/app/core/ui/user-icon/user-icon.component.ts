import { Component, EventEmitter, HostListener, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';
import { IMyProfile } from '../../../interfaces';
import { Location } from '@angular/common';
import { WindowService } from '../../../services/window.service';
import { ThemeService } from '../../../services/theme.service';
import { UserService } from '../../../services/user.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'ui-user-icon',
  templateUrl: './user-icon.component.html',
  styleUrls: ['./user-icon.component.scss']
})
export class UserIconComponent implements OnInit, OnDestroy {

  @Input() loggedInUserProfile?: IMyProfile
  @Output() needLogin = new EventEmitter<void>();
  open = false;
  userMenuRouteLoaded = false;
  profilePictureUrl: SafeUrl | string | null = null;
  private destroy$ = new Subject<void>();

  get myProfile(): IMyProfile | undefined {
    return this.loginService.getProfileFromStorage()
  }

  constructor(
    private loginService: LoginService,
    private router: Router,
    private windowService: WindowService,
    private location: Location,
    public themeService: ThemeService,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    if (this.router.url === '/user/menu')
      this.userMenuRouteLoaded = true;

    this.loadProfilePicture();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfilePicture(): void {
    const savedPicture = this.userService.getProfilePictureToStorage();
    if (savedPicture) {
      this.profilePictureUrl = this.sanitizer.bypassSecurityTrustUrl(savedPicture);
    } else {
      this.userService.getMyProfilePicture()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response?.success && response.data) {
              this.profilePictureUrl = response.data;
              if (typeof this.profilePictureUrl === 'string')
                this.userService.saveProfilePictureToStorage(this.profilePictureUrl);
            }
          },
          error: (error) => {
            console.error('Error loading profile picture in user-icon:', error);
          }
        });
    }
  }

  toggle() {
    if (!this.loggedInUserProfile) {
      this.needLogin.emit();
      return;
    }

    if (this.windowService.mode.value === 'mobile') {
      if (!this.userMenuRouteLoaded)
      this.router.navigateByUrl('/user/menu');
    else
      this.location.back();
    } else {
      // Desktop: toggle the dropdown
      this.open = !this.open;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    const target = e.target as HTMLElement;
    // close if clicked outside
    if (!target.closest('.user-root')) { this.open = false; }
  }

  logout() {
    // emit or route to logout (hook up from parent)
    console.log('logout clicked');
    this.loginService.logout();
  }

  onProfileClick() {
    console.log('Profile clicked');
    this.router.navigateByUrl('/profile');
    this.open = false; // Close dropdown after click
  }

  onHelpClick() {
    console.log('Help clicked');
    this.open = false;
  }

  onRegisterSocietyClick() {
    console.log('Register Society clicked');
    this.router.navigateByUrl('/society-public/add');
    this.open = false; // Close dropdown after click
  }

  onDemoClick() {
    console.log('Request Demo clicked');
    this.router.navigateByUrl('/demo/book');
    this.open = false; // Close dropdown after click
  }
}
