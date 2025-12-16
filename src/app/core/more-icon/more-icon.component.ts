import { Component, ContentChildren, ElementRef, HostListener, QueryList } from '@angular/core';

@Component({
  selector: 'app-more-icon',
  templateUrl: './more-icon.component.html',
  styleUrls: ['./more-icon.component.scss']
})
export class MoreIconComponent {

  open = false;

  @ContentChildren(ElementRef, { descendants: true })
  projectedContent!: QueryList<ElementRef>;

  constructor() {}

  toggle() { this.open = !this.open; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    const target = e.target as HTMLElement;
    // close if clicked outside
    if (!target.closest('.user-root')) { this.open = false; }
  }
}
