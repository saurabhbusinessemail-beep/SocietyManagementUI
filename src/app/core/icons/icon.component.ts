import { Component, Input, OnInit } from '@angular/core';
import { IconsService } from './icons.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-icon',
  template: `<span class="app-icon" [innerHTML]="svg"></span>`,
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
  svg: SafeHtml | null = null;

  constructor(private iconService: IconsService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.iconService.getIcon(this.name).subscribe(svg => {
      this.svg = this.sanitizer.bypassSecurityTrustHtml(svg);
    });
  }
}

