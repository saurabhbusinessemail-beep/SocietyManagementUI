import { Component, Input } from '@angular/core';
import { IMenu } from '../../interfaces';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  
  @Input() title?: string;
  @Input() menuItems: IMenu[] = [];
  @Input() hideMoreActions: boolean = false;

  constructor(public menuService: MenuService) {}
}
