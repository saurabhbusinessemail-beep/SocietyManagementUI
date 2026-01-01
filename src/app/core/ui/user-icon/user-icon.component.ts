import { Component, HostListener } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ui-user-icon',
  templateUrl: './user-icon.component.html',
  styleUrls: ['./user-icon.component.scss']
})
export class UserIconComponent {
  open = false;

  constructor(private loginService: LoginService, private router: Router) {}

  toggle() { this.open = !this.open; }

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

  gotoNew() {
    this.router.navigateByUrl('/dashboard/user')
  }
}
