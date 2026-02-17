import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IFlat, IBuilding, ISociety, IUser } from '../../../interfaces';

@Component({
  selector: 'ui-flat-card',
  templateUrl: './flat-card.component.html',
  styleUrls: ['./flat-card.component.scss']
})
export class FlatCardComponent {
  @Input() flat!: IFlat;
  @Input() showEdit = false;
  @Input() showDelete = false;

  @Input() selectMode = false;
  @Input() selected = false;
  @Output() selectedChange = new EventEmitter<boolean>();

  @Output() edit = new EventEmitter<IFlat>();
  @Output() delete = new EventEmitter<IFlat>();

  /**
   * Returns a display string for the building.
   */
  getBuildingDisplay(): string {
    const building = this.flat.buildingId;
    if (!building) return '—';
    if (typeof building === 'object' && 'buildingNumber' in building) {
      return `Building ${building.buildingNumber}`;
    }
    // It's a string ID
    return `ID: ${this.truncateId(building)}`;
  }

  /**
   * Returns a display string for the society.
   */
  getSocietyDisplay(): string {
    const society = this.flat.societyId;
    if (!society) return '—';
    if (typeof society === 'object' && 'societyName' in society) {
      return society.societyName;
    }
    // It's a string ID
    return `ID: ${this.truncateId(society)}`;
  }

  /**
   * Returns display name for the creator.
   */
  getCreatedByDisplay(): string {
    const createdBy = this.flat.createdByUserId;
    if (!createdBy) return '—';
    if (typeof createdBy === 'object') {
      if ('name' in createdBy && createdBy.name) return createdBy.name;
      if ('email' in createdBy) return createdBy.email ?? 'N/A';
      return 'Unknown';
    }
    return `ID: ${this.truncateId(createdBy)}`;
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
    this.edit.emit(this.flat);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.flat);
  }

  toggleSelection(event: Event): void {
    this.selectedChange.emit(!this.selected);
  }
}