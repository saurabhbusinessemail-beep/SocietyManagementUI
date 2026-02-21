import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface FooterIcon {
  icon: string; label?: string; url: string;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  @Input() showMenu = false;
  @Input() showHome = false;
  @Input() showDashboard = false;

  @Output() menuClicked = new EventEmitter<void>();
  @Output() homeClicked = new EventEmitter<void>();
  @Output() dashboardClicked = new EventEmitter<void>();

  curYear = (new Date()).getFullYear();
}
