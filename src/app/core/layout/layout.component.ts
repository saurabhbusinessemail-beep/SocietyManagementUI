import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { IMenu, IMyProfile } from '../../interfaces';
import { MenuService } from '../../services/menu.service';
import { WindowService } from '../../services/window.service';
import { Location } from '@angular/common';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {

  @Input() title?: string;
  @Input() menuItems: IMenu[] = [];
  @Input() hideMoreActions: boolean = false;
  @Input() navMenuItems: string[] = [];
  @Input() showBackButton = false;
  @Output() needLogin = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<string>();


  loggedInUserProfile?: IMyProfile;

  constructor(
    private logginService: LoginService,
    public menuService: MenuService,
    private windowServic: WindowService,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.windowServic.evaluateMode();
    this.loggedInUserProfile = this.logginService.getProfileFromStorage();
  }

  @HostListener('window:resize')
  onResize() { this.windowServic.evaluateMode(); }

  handleHomeButtonClick() {
    this.menuService.syncSelectedMenuWithCurrentUrl(true);
  }

  goBack() {
    this.location.back();
  }
}
