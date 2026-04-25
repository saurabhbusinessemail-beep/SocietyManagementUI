import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ISociety, IUser, ICurrentPlanResponse } from '../../../interfaces';

@Component({
  selector: 'ui-society-card',
  templateUrl: './society-card.component.html',
  styleUrl: './society-card.component.scss'
})
export class SocietyCardComponent {

  @Input() society!: ISociety;
  @Input() plan?: ICurrentPlanResponse;
  @Input() loadingPlans = false;
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

  /**
   * Get plan display name with duration
   */
  getPlanDisplayName(): string {
    if (!this.plan) return 'No Active Plan';

    // Use planDetails.name if available, otherwise fallback to planName
    let display = this.plan.planDetails?.name || this.plan.planName || 'No Plan';
    if (this.plan.selectedDuration) {
      const { value, unit } = this.plan.selectedDuration;
      if (unit === 'months') {
        display += ` (${value} Month${value > 1 ? 's' : ''})`;
      } else {
        display += ` (${value} Year${value > 1 ? 's' : ''})`;
      }
    }
    return display;
  }

  /**
   * Get remaining days for the plan
   */
  getRemainingDays(): number {
    if (!this.plan?.usage?.remainingDays) return 0;
    return this.plan.usage.remainingDays;
  }

  /**
   * Get plan icon from planDetails
   */
  getPlanIcon(): string {
    if (!this.plan?.planDetails?.icon) return 'alert-circle';
    return this.plan.planDetails.icon;
  }

  /**
   * Get plan badge background color from planDetails colors
   */
  getPlanBadgeColor(): string {
    if (!this.plan?.planDetails?.colors?.primary) return '#6b7280';
    return this.plan.planDetails.colors.lighter;
  }

  /**
   * Get plan text color based on plan type
   * For starter trial, use primary color (dark text on light background)
   * For others, use white text on dark background
   */
  getPlanTextColor(): string {
    if (!this.plan) return 'var(--color-white)';

    const planName = this.plan.planDetails.name?.toLowerCase() || '';
    // For starter trial with light background, use primary color for dark text

    return this.plan.planDetails.colors.primary;
  }

  /**
   * Get plan light color for optional backgrounds (like hover states)
   */
  getPlanLightColor(): string {
    if (!this.plan?.planDetails?.colors?.light) return '#f3f4f6';
    return this.plan.planDetails.colors.light;
  }

  /**
   * Check if plan is expiring soon (30 days or less)
   */
  isExpiringSoon(): boolean {
    const remainingDays = this.getRemainingDays();
    return remainingDays > 0 && remainingDays <= 30;
  }

  /**
   * Check if plan is expired
   */
  isExpired(): boolean {
    return this.plan?.planDetails.id !== 'basic' && this.getRemainingDays() <= 0;
  }
}