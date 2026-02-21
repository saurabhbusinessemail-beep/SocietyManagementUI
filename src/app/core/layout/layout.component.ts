import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { IMenu } from '../../interfaces';
import { MenuService } from '../../services/menu.service';
import { WindowService } from '../../services/window.service';
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
  @Input() showBackButton = false;

  constructor(
    public menuService: MenuService,
    private windowServic: WindowService,
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
}
