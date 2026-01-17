import { Component, HostListener, Input, OnInit } from '@angular/core';
import { IMenu } from '../../interfaces';
import { MenuService } from '../../services/menu.service';
import { WindowService } from '../../services/window.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {

  @Input() title?: string;
  @Input() menuItems: IMenu[] = [];
  @Input() hideMoreActions: boolean = false;

  constructor(public menuService: MenuService, private windowServic: WindowService) { }

  ngOnInit(): void {
    this.windowServic.evaluateMode();
  }

  @HostListener('window:resize')
  onResize() { this.windowServic.evaluateMode(); }
}
