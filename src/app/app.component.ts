import { Component, OnInit } from '@angular/core';
import { MenuService } from './services/menu.service';
import { filter, take } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  show = false;
  title = 'SocietyManagementUI';

  constructor(private router: Router, private menuService: MenuService) { }

  ngOnInit(): void {

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event: NavigationEnd) => {


        this.menuService.userMenus.pipe(take(1))
          .subscribe(res => {
            this.menuService.syncSelectedMenuWithCurrentUrl();
          });
      })
  }
}
