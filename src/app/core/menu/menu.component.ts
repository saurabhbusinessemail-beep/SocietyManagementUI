import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { IMenu } from '../../interfaces';
import { MenuService } from '../../services/menu.service';
import { Mode } from '../../types';
import { WindowService } from '../../services/window.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
  @Input() initialOpen = true;
  @Input() menuItems: IMenu[] = []
  open = true; // expanded state (desktop) or overlay open
  isComponentActive = new Subject<void>();

  constructor(public menuService: MenuService, public windowService: WindowService) { }

  ngOnInit(): void {
    this.windowService.mode
    .pipe(takeUntil(this.isComponentActive))
    .subscribe(mode => {
      switch(mode) {
        case 'desktop': this.open = true; break;
        case 'tablet': this.open = false; break;
        case 'mobile': this.open = false; break;
      }
    });
  }

  toggleMenu() {
    // Desktop: toggle collapse/expand
    if (this.windowService.mode.value === 'desktop') { this.open = !this.open; return; }
    // Tablet/mobile: open overlay/drawer
    this.open = !this.open;
  }

  closeOverlay(menu?: IMenu) {
    if (this.windowService.mode.value !== 'desktop') this.open = false;

    if (menu) {
      this.menuService.selectAndLoadMenu(menu);
    }
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
