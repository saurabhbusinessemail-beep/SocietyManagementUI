import { Component, Output, EventEmitter } from '@angular/core';

export interface FooterIcon {
  icon: string; label?: string; url: string;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  
  @Output() backButtonClicked = new EventEmitter<void>();

  handleBackButtonClick() {
    this.backButtonClicked.emit();
  }
}
