import { Component, HostListener, OnInit } from '@angular/core';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';
import { IMyProfile } from '../../../interfaces';

@Component({
  selector: 'ui-user-icon',
  templateUrl: './user-icon.component.html',
  styleUrls: ['./user-icon.component.scss']
})
export class UserIconComponent implements OnInit {

  open = false;
  
  get myProfile(): IMyProfile | undefined {
    return this.loginService.getProfileFromStorage()
  }

  constructor(private loginService: LoginService) { }

  ngOnInit(): void {
  }

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
}
