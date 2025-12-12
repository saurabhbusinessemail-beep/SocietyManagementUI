import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Output() toggleMenu = new EventEmitter<void>();
  // center dropdown example
  dropdownOptions = ['Option A', 'Option B', 'Option C'];
  selected = this.dropdownOptions[0];

  constructor() { }

  ngOnInit(): void { }

  onMenuClick() {
    this.toggleMenu.emit();
  }

  onSelectChange(val: string) {
    this.selected = val;
  }
}
