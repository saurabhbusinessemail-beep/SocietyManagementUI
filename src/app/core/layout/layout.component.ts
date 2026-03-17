import { Component, EventEmitter, HostListener, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { IMenu, IMyProfile } from '../../interfaces';
import { MenuService } from '../../services/menu.service';
import { WindowService } from '../../services/window.service';
import { Location } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';

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
  @Input() extendedMenuTemplate?: TemplateRef<any>;
  @Output() needLogin = new EventEmitter<void>();
  @Output() menuItemClick = new EventEmitter<string>();


  get loggedInUserProfile(): IMyProfile | undefined {
    return this.logginService.getProfileFromStorage();
  }

  constructor(
    private logginService: LoginService,
    public menuService: MenuService,
    private windowServic: WindowService,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.windowServic.evaluateMode();
  }

  @HostListener('window:resize')
  onResize() { this.windowServic.evaluateMode(); }

  handleHomeButtonClick() {
    this.menuService.syncSelectedMenuWithCurrentUrl(true);
  }

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigateByUrl('');
  }
}
