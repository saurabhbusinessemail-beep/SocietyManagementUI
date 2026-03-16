import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-navbar-menu',
  templateUrl: './navbar-menu.component.html',
  styleUrl: './navbar-menu.component.scss'
})
export class NavbarMenuComponent {
  @Input() menuItems: string[] = []; // Input array of menu items
  @Output() menuItemClick = new EventEmitter<string>();

  // Handle menu item click
  onMenuItemClick(item: string, event: Event): void {
    event.preventDefault(); // Prevent default anchor behavior
    this.menuItemClick.emit(item); // Emit the clicked menu item
  }

  // Generate href for accessibility (optional)
  generateHref(item: string): string {
    return '#' + item.toLowerCase().replace(/\s+/g, '-');
  }
}
