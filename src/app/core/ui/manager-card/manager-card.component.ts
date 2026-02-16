import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IUser } from '../../../interfaces';

@Component({
  selector: 'ui-manager-card',
  templateUrl: './manager-card.component.html',
  styleUrl: './manager-card.component.scss'
})
export class ManagerCardComponent {
  @Input() user!: IUser;
  @Input() showEdit = false;
  @Input() showDelete = false;

  @Output() edit = new EventEmitter<IUser>();
  @Output() delete = new EventEmitter<IUser>();

  /**
   * Returns the display name: name if present, otherwise email.
   */
  getUserDisplayName(): string {
    return this.user.name?.trim() || this.user.email;
  }

  /**
   * Returns initials for the avatar placeholder (first letter of name or email).
   */
  getUserInitials(): string {
    if (this.user.name) {
      return this.user.name.charAt(0).toUpperCase();
    }
    return this.user.email.charAt(0).toUpperCase();
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.edit.emit(this.user);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.user);
  }
}
