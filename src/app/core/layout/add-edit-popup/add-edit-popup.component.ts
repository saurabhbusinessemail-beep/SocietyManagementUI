import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-add-edit-popup',
  templateUrl: './add-edit-popup.component.html',
  styleUrl: './add-edit-popup.component.scss'
})
export class AddEditPopupComponent {
  @Input() title: string = '';
  @Output() onClose = new EventEmitter<void>();

  onCloseClick(): void {
    this.onClose.emit();
  }
}
