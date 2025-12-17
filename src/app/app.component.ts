import { Component } from '@angular/core';
import { LoginService } from './services/login.service';
import { MenuService } from './services/menu.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  show = false;
  title = 'SocietyManagementUI';

  constructor(private loginService: LoginService, private menuService: MenuService) {}
}
