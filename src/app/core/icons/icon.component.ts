import { Component, Input, OnInit } from '@angular/core';
import { IconsService } from './icons.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icon',
  template: `<span class="app-icon" [innerHTML]="svg" [style.color]="color" [style.height.px]="sizeValue" [style.width.px]="sizeValue"></span>`,
  styles: [`
    .app-icon {
      display: inline-flex;
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    .app-icon svg {
      width: 100%;
      height: 100%;
    }
  `]
})
export class IconComponent implements OnInit {
  
  @Input() name!: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' = 'lg';
  @Input() color: string = '';
  svg: SafeHtml | null = null;

  get sizeValue(): number {
    switch(this.size) {
      case 'sm': return 8;
      case 'md': return 10;
      case 'xl': return 16;
      case 'xxl': return 32;
      case 'xxxl': return 64;
      default: return 14;
    }
  }

  constructor(private iconService: IconsService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.iconService.getIcon(this.name).subscribe(svg => {
      this.svg = this.sanitizer.bypassSecurityTrustHtml(svg);
    });
  }
}

