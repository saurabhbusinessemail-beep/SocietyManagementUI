import { Component, Input } from '@angular/core';

export interface FooterIcon {
  icon: string; label?: string; url: string;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input() config: FooterIcon[] = [];

  curYear = (new Date()).getFullYear();
}
