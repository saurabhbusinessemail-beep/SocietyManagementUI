import { Component } from '@angular/core';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class LogoutComponent {

  constructor(private loginService: LoginService) {
    this.loginService.logout();
  }
}
