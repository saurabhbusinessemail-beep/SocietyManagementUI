import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { IMenu } from '../../interfaces';
import { MenuService } from '../../services/menu.service';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';

export interface FooterIcon {
  icon: string; label?: string; url: string;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {

  isComponentActive = new Subject<void>();
  topTwoMenus: IMenu[] = [];

  constructor(public menuService: MenuService, private router: Router) { }

  ngOnInit(): void {
    this.menuService.filteredMenus
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(filteredMenus => {
        this.topTwoMenus = filteredMenus.slice(0, 3);
      })
  }

  navigateToMenu(menu: IMenu) {
    this.menuService.selectAndLoadMenu(menu);
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
