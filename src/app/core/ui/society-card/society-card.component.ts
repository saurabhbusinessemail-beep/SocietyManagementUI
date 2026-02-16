import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ISociety, IUser } from '../../../interfaces';

@Component({
  selector: 'ui-society-card',
  templateUrl: './society-card.component.html',
  styleUrl: './society-card.component.scss'
})
export class SocietyCardComponent {

  @Input() society!: ISociety;
  @Output() clicked = new EventEmitter<void>();

  /**
   * Returns a displayable list of admin contact names/strings.
   */
  getAdminContactsDisplay(): string[] {
    return this.getNamesFromArray(this.society.adminContacts);
  }

  /**
   * Returns a displayable list of manager names/strings.
   */
  getManagerIdsDisplay(): string[] {
    return this.getNamesFromArray(this.society.managerIds);
  }

  /**
   * Converts an array of string | IUser into an array of display names.
   */
  private getNamesFromArray(arr: string[] | IUser[]): string[] {
    if (!arr || arr.length === 0) {
      return [];
    }
    // Check the type of the first element
    if (typeof arr[0] === 'string') {
      return arr as string[];
    } else {
      // Assume it's an array of IUser objects
      return (arr as IUser[]).map(user => this.getUserName(user));
    }
  }

  /**
   * Extracts a human-readable name from an IUser object.
   * Supports common property names: name, fullName, firstName+lastName, email.
   */
  private getUserName(user: IUser): string {
    if ('name' in user) return (user as any).name;
    if ('fullName' in user) return (user as any).fullName;
    if ('firstName' in user && 'lastName' in user) {
      return `${(user as any).firstName} ${(user as any).lastName}`;
    }
    if ('email' in user) return (user as any).email;
    return 'Unknown User';
  }

  /**
   * Returns a formatted address string from the gpsLocation field.
   */
  getAddressDisplay(): string {
    const loc = this.society.gpsLocation;
    if (!loc) return '';
    // Handle string directly
    if (typeof loc === 'string') return loc;
    // Common UILocationResult properties
    if ('formattedAddress' in loc) return (loc as any).formattedAddress;
    if ('address' in loc) return (loc as any).address;
    // Fallback: JSON representation
    return JSON.stringify(loc);
  }

  /**
   * Returns the display name for the creator.
   */
  getCreatedByDisplay(): string {
    const createdBy = this.society.createdByUserId;
    if (!createdBy) return '';
    if (typeof createdBy === 'string') return createdBy;
    return this.getUserName(createdBy);
  }

  /**
   * Returns the display name for the last modifier, or null if absent.
   */
  getModifiedByDisplay(): string | null {
    const modifiedBy = this.society.modifiedByUserId;
    if (!modifiedBy) return null;
    if (typeof modifiedBy === 'string') return modifiedBy;
    return this.getUserName(modifiedBy);
  }
}
