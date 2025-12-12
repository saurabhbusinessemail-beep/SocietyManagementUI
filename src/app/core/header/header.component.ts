import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

type Mode = 'desktop' | 'tablet' | 'mobile';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Input() showSocietyFilter = false;
  @Output() toggleMenu = new EventEmitter<void>();
  
  // center dropdown example
  dropdownOptions = ['Option A', 'Option B', 'Option C'];
  selected = this.dropdownOptions[0];
  mode: Mode = 'desktop';

  constructor() { }

  ngOnInit(): void {
    this.evaluateMode();
  }
  
  @HostListener('window:resize')
  onResize() { this.evaluateMode(); }

  evaluateMode() {
    const w = window.innerWidth;
    if (w >= 992) { this.mode = 'desktop' }
    else if (w >= 768) { this.mode = 'tablet' } // icons only
    else { this.mode = 'mobile'  }
  }

  onMenuClick() {
    this.toggleMenu.emit();
  }

  onSelectChange(val: string) {
    this.selected = val;
  }
}
