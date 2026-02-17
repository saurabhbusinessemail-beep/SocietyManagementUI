import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IBuilding } from '../../../interfaces';

@Component({
  selector: 'ui-building-card',
  templateUrl: './building-card.component.html',
  styleUrl: './building-card.component.scss'
})
export class BuildingCardComponent {
  @Input() building!: IBuilding;
  @Input() showEdit = false;
  @Input() showDelete = false;

  @Input() selectMode = false;
  @Input() selected = false;
  @Output() selectedChange = new EventEmitter<boolean>();

  @Output() edit = new EventEmitter<IBuilding>();
  @Output() delete = new EventEmitter<IBuilding>();

  /**
   * Returns a display string for the society.
   * If society is an object, use societyName; otherwise show the ID.
   */
  getSocietyDisplay(): string {
    const society = this.building.societyId;
    if (!society) return '—';
    if (typeof society === 'object' && 'societyName' in society) {
      return society.societyName;
    }
    // It's a string ID – truncate for display
    return `ID: ${this.truncateId(society)}`;
  }

  /**
   * Returns a display string for the manager.
   * If manager is an object, try to get name or email; otherwise show the ID.
   */
  getManagerDisplay(): string {
    const manager = this.building.managerId;
    if (!manager) return '—';
    if (typeof manager === 'object') {
      // Try to get name or email from IUser
      if ('name' in manager && manager.name) return manager.name;
      if ('email' in manager) return manager.email ?? 'N/A';
      return 'Unknown Manager';
    }
    // It's a string ID
    return `ID: ${this.truncateId(manager)}`;
  }

  /**
   * Returns display name for the creator.
   */
  getCreatedByDisplay(): string {
    const createdBy = this.building.createdByUserId;
    if (!createdBy) return '—';

    if (typeof createdBy === 'object') {
      if ('name' in createdBy && createdBy.name) return createdBy.name;
      if ('email' in createdBy) return createdBy.email ?? 'N/A';
      return 'Unknown';
    }
    return `ID: ${this.truncateId(createdBy)}`;
  }

  /**
   * Returns display name for the last modifier, or null if absent.
   */
  getModifiedByDisplay(): string | null {
    const modifiedBy = this.building.modifiedByUserId;
    if (!modifiedBy) return null;
    if (typeof modifiedBy === 'object') {
      if ('name' in modifiedBy && modifiedBy.name) return modifiedBy.name;
      if ('email' in modifiedBy) return modifiedBy.email ?? 'N/A';
      return 'Unknown';
    }
    return `ID: ${this.truncateId(modifiedBy)}`;
  }

  /**
   * Truncates a long ID for display (e.g., "abc123...xyz").
   */
  private truncateId(id: string, maxLength: number = 8): string {
    if (id.length <= maxLength) return id;
    const start = id.substring(0, 4);
    const end = id.substring(id.length - 4);
    return `${start}...${end}`;
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.edit.emit(this.building);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.building);
  }

  toggleSelection(event: Event): void {
    this.selectedChange.emit(!this.selected);
  }
}
