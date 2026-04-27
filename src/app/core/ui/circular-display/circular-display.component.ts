import { Component, Input, OnInit, AfterContentInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ui-circular-display',
  templateUrl: './circular-display.component.html',
  styleUrls: ['./circular-display.component.scss']
})
export class CircularDisplayComponent implements OnInit, AfterContentInit {
  @Input() label?: string;
  @Input() showLabel: boolean = true;
  @Input() iconColor: string = 'var(--color-link)';
  @Input() backgroundColor: string = 'color-mix(in srgb, var(--color-link), transparent 90%)';
  @Input() containerBackground: string = 'rgba(var(--color-white-rgb), 0.6)';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() variant: 'default' | 'bordered' | 'shadow' = 'default';

  @Output() onClicked = new EventEmitter<void>();

  initials: string = '';
  private hasContent: boolean = false;

  ngOnInit(): void {
    if (this.label && !this.hasProjectedContentFlag()) {
      this.initials = this.generateInitials(this.label);
    }
  }

  ngAfterContentInit(): void {
    // Check if there's any projected content
    this.hasContent = this.hasProjectedContent();
  }

  private generateInitials(name: string): string {
    if (!name) return '';

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      const singleWord = words[0];
      if (singleWord.length >= 3) {
        return singleWord.substring(0, 3).toUpperCase();
      } else {
        return singleWord.toUpperCase();
      }
    } else if (words.length === 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
  }

  hasProjectedContent(): boolean {
    // This will be properly implemented in ngAfterContentInit
    return false;
  }

  hasProjectedContentFlag(): boolean {
    return this.hasContent;
  }

  shouldShowInitials(): boolean {
    return !this.hasContent && !!this.initials;
  }

  shouldShowProjected(): boolean {
    return this.hasContent;
  }

  getSizeClass(): string {
    switch (this.size) {
      case 'sm': return 'circle-sm';
      case 'md': return 'circle-md';
      case 'lg': return 'circle-lg';
      case 'xl': return 'circle-xl';
      case 'full': return 'circle-full';
      default: return 'circle-md';
    }
  }

  getContainerClass(): string {
    let classes = ['circular-container'];
    if (this.variant === 'bordered') {
      classes.push('container-bordered');
    } else if (this.variant === 'shadow') {
      classes.push('container-shadow');
    }
    return classes.join(' ');
  }
}