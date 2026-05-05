import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../../services/login.service';
import { IMenu, IMyProfile, IUIDropdownOption } from '../../../interfaces';
import { Location } from '@angular/common';
import { MenuService } from '../../../services/menu.service';
import { IconsService } from '../../../core/icons/icons.service';
import { SocietyService } from '../../../services/society.service';
import { ThemeService } from '../../../services/theme.service';
import { Subscription, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { UserService } from '../../../services/user.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-user-menu-page',
  templateUrl: './user-menu-page.component.html',
  styleUrls: ['./user-menu-page.component.scss']
})
export class UserMenuPageComponent implements OnInit, OnDestroy {

  get myProfile(): IMyProfile | undefined {
    return this.loginService.getProfileFromStorage();
  }

  get filteredMenus() {
    return this.menuService.filteredMenusValue;
  }

  societyOptions: IUIDropdownOption[] = [];
  selectedSociety: IUIDropdownOption | null = null;
  showDropdown = false;
  loading = true;

  get isPricingPlanLoading() {
    return this.societyService.societyPlanLoading;
  }

  profilePictureUrl: SafeUrl | string | null = null;
  private destroy$ = new Subject<void>();
  private subscription = new Subscription();

  constructor(
    private loginService: LoginService,
    private router: Router,
    private location: Location,
    private menuService: MenuService,
    public iconService: IconsService,
    private societyService: SocietyService,
    public themeService: ThemeService,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadSocieties();
    this.subscription.add(
      this.societyService.selectedSocietyFilter.subscribe(selected => {
        this.selectedSociety = selected || null;
      })
    );
    this.loadProfilePicture();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
            console.error('Error loading profile picture:', error);
          }
        });
    }
  }

  loadSocieties(): void {
    this.loading = true;
    this.societyService.getAllSocieties()
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.societyOptions = response.data.map(society => ({
            label: society.societyName,
            value: society._id
          } as IUIDropdownOption));
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load societies', err);
          this.loading = false;
        }
      });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // Check if the click is inside the society selector container
    const isInside = target.closest('.society-selector');
    if (!isInside && this.showDropdown) {
      this.showDropdown = false;
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  selectSociety(option: IUIDropdownOption): void {
    this.societyService.selectSocietyFilter(option);
    this.showDropdown = false;
  }

  clearSociety(): void {
    // this.societyService.clearSocietyFilter();
    this.showDropdown = false;
  }

  closeMenu(): void {
    this.location.back();
  }

  onMenuClick(menu: IMenu) {
    if (menu.relativePath) {
      this.menuService.selectAndLoadMenu(menu);
    }
  }

  onRegisterSocietyClick(): void {
    this.router.navigateByUrl('/society-public/add');
  }

  onDemoClick(): void {
    this.router.navigateByUrl('/demo/book');
  }

  onProfileClick(): void {
    this.router.navigateByUrl('/profile');
  }

  onHelpClick(): void {
    this.router.navigateByUrl('/help-support');
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigateByUrl('/login');
  }
}