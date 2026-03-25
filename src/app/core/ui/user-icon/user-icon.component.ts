import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';
import { IMyProfile } from '../../../interfaces';
import { WindowService } from '../../../services/window.service';

@Component({
  selector: 'ui-user-icon',
  templateUrl: './user-icon.component.html',
  styleUrls: ['./user-icon.component.scss']
})
export class UserIconComponent implements OnInit {

  @Input() loggedInUserProfile?: IMyProfile
  @Output() needLogin = new EventEmitter<void>();
  open = false;

  get myProfile(): IMyProfile | undefined {
    return this.loginService.getProfileFromStorage()
  }

  constructor(
    private loginService: LoginService,
    private router: Router,
    private windowService: WindowService
  ) { }

  ngOnInit(): void {
  }

  toggle() {
    // if (this.loggedInUserProfile)
    //   this.open = !this.open;
    // else
    //   this.needLogin.emit();
    if (!this.loggedInUserProfile) {
      this.needLogin.emit();
      return;
    }

    // Check if we're on mobile
    if (this.windowService.mode.value === 'mobile') {
      // Navigate to the new menu page instead of opening dropdown
      this.router.navigateByUrl('/user/menu');
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
