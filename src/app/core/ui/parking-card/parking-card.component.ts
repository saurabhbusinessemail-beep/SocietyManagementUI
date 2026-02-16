import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IParking, IBuilding, ISociety, IFlat, IUser } from '../../../interfaces';
import { VehicleTypes } from '../../../constants';

@Component({
  selector: 'ui-parking-card',
  templateUrl: './parking-card.component.html',
  styleUrls: ['./parking-card.component.scss']
})
export class ParkingCardComponent {
  @Input() parking!: IParking;
  @Input() showEdit = false;
  @Input() showDelete = false;

  @Output() edit = new EventEmitter<IParking>();
  @Output() delete = new EventEmitter<IParking>();

  /**
   * Returns a CSS-friendly class for the parking type badge.
   * Converts "2 Wheeler" to "2w", etc.
   */
  getParkingTypeClass(): string {
    const type = this.parking.parkingType;
    if (type === VehicleTypes['2W']) return '2w';
    if (type === VehicleTypes['3W']) return '3w';
    if (type === VehicleTypes['4W']) return '4w';
    if (type === VehicleTypes['6W']) return '6w';
    return '';
  }

  /**
   * Returns a display string for the building.
   */
  getBuildingDisplay(): string {
    const building = this.parking.buildingId;
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
    const society = this.parking.societyId;
    if (!society) return '—';
    if (typeof society === 'object' && 'societyName' in society) {
      return society.societyName;
    }
    // It's a string ID
    return `ID: ${this.truncateId(society)}`;
  }

  /**
   * Returns a display string for the flat.
   */
  getFlatDisplay(): string {
    const flat = this.parking.flatId;
    if (!flat) return '—';
    if (typeof flat === 'object' && 'flatNumber' in flat) {
      return `Flat ${flat.flatNumber}`;
    }
    // It's a string ID
    return `ID: ${this.truncateId(flat)}`;
  }

  /**
   * Returns display name for the creator.
   */
  getCreatedByDisplay(): string {
    const createdBy = this.parking.createdByUserId;
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
    this.edit.emit(this.parking);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.parking);
  }
}