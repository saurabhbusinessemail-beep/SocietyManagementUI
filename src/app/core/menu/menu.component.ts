import { Component, HostListener, Input, OnInit } from '@angular/core';

type Mode = 'desktop' | 'tablet' | 'mobile';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @Input() initialOpen = true;
  mode: Mode = 'desktop';
  open = true; // expanded state (desktop) or overlay open

  menuItems = [
    { icon: '🏠', label: 'Home', route: '/' },
    { icon: '📁', label: 'Files', route: '/files' },
    { icon: '⚙️', label: 'Settings', route: '/settings' }
  ];

  constructor() { }

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

  closeOverlay() {
    if (this.mode !== 'desktop') this.open = false;
  }
}
