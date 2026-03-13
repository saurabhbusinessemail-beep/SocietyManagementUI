import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ui-form-layout',
  templateUrl: './form-layout.component.html',
  styleUrl: './form-layout.component.scss'
})
export class FormLayoutComponent {
  @Input() showAsSection = false;
  @Input() title?: string;
  @Input() colorTheme?: ''
  | 'gradient-sky-ocean'
  | 'gradient-header-breeze'
  | 'gradient-status-rainbow'
  | 'gradient-success-purchase'
  | 'gradient-warning-error'
  | 'gradient-cool-blues'
  | 'gradient-status-dashboard'
  | 'gradient-purple-blue'
  | 'gradient-error-alert'
  | 'gradient-light-airy'
  | 'gradient-button-primary'
  | 'gradient-complete-spectrum'
  | 'gradient-metallic-blue'
  | 'gradient-icon-inspire'
  | 'gradient-multi-directional'
  | 'gradient-pastel-dreams'
  | 'gradient-corporate'
  | 'gradient-status-ring'
  | 'gradient-header-footer'
  | 'gradient-sunset-ocean'
  | 'gradient-modern-ui'
  | 'gradient-subtle-bg'
  | 'gradient-border-highlight'
  | 'gradient-deep-space'
  | 'gradient-fresh-clean';
  

  get formClasses() {
    let classes = '';

    if (this.showAsSection) classes += ' section-view'
    if (this.colorTheme) classes += ' ' + this.colorTheme

    return classes;
  }
}
