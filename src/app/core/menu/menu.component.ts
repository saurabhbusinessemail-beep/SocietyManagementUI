import { Component, HostListener, Input, OnInit } from '@angular/core';
import { IMenu } from '../../interfaces';
import { MenuService } from '../../services/menu.service';
import { Mode } from '../../types';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @Input() initialOpen = true;
  @Input() menuItems: IMenu[] = []
  mode: Mode = 'desktop';
  open = true; // expanded state (desktop) or overlay open

  // menuItems: IMenu[] = [
  //   { menuId: 'w', icon: 'home', menuName: 'Home', relativePath: '/', submenus: [], createdOn: new Date(), createdByUserId: '' },
  //   { menuId: 'w', icon: 'home', menuName: 'Home', relativePath: '/temp', submenus: [], createdOn: new Date(), createdByUserId: '' },
  // ];

  constructor(public menuService: MenuService) { }

  ngOnInit(): void {
    this.evaluateMode();
  }

  @HostListener('window:resize')
  onResize() { this.evaluateMode(); }

  evaluateMode() {
    const w = window.innerWidth;
    if (w >= 992) { this.mode = 'desktop'; this.open = true; }
    else if (w >= 768) { this.mode = 'tablet'; this.open = false; } // icons only
    else { this.mode = 'mobile'; this.open = false; }
  }

  toggleMenu() {
    // Desktop: toggle collapse/expand
    if (this.mode === 'desktop') { this.open = !this.open; return; }
    // Tablet/mobile: open overlay/drawer
    this.open = !this.open;
  }

  closeOverlay(menu?: IMenu) {
    if (this.mode !== 'desktop') this.open = false;

    if (menu) {
      this.menuService.selectAndLoadMenu(menu);
    }
  }
}
