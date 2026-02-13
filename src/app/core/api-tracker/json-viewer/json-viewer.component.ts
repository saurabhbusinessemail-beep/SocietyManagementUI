import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-json-viewer',
  templateUrl: './json-viewer.component.html',
  styleUrls: ['./json-viewer.component.scss']
})
export class JsonViewerComponent {

  @Input() data: any;
  @Input() level = 0;

  expanded = true;

  toggle() {
    this.expanded = !this.expanded;
  }

  isObject(value: any): boolean {
    return value && typeof value === 'object';
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  keys(obj: any): string[] {
    return Object.keys(obj);
  }
}
