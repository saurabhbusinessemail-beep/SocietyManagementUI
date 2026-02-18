import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IVehicle, IUser } from '../../../interfaces'; // adjust path
import { VehicleTypes } from '../../../constants';

@Component({
  selector: 'ui-vehicle-card',
  templateUrl: './vehicle-card.component.html',
  styleUrls: ['./vehicle-card.component.scss']
})
export class VehicleCardComponent {
  @Input() vehicle!: IVehicle;
  @Input() showEdit = false;
  @Input() showDelete = false;
  @Input() selectMode = false;
  @Input() selected = false;

  @Output() edit = new EventEmitter<IVehicle>();
  @Output() delete = new EventEmitter<IVehicle>();
  @Output() selectedChange = new EventEmitter<boolean>();

  getVehicleTypeIcon(): string {
    switch (this.vehicle.vehicleType) {
      case VehicleTypes['2W']: return '🛵';
      case VehicleTypes['3W']: return '🛺';
      case VehicleTypes['4W']: return '🚗';
      case VehicleTypes['6W']: return '🚛';
      default: return '🚘';
    }
  }

  getVehicleTypeClass(): string {
    switch (this.vehicle.vehicleType) {
      case VehicleTypes['2W']: return 'two-wheeler';
      case VehicleTypes['3W']: return 'three-wheeler';
      case VehicleTypes['4W']: return 'four-wheeler';
      case VehicleTypes['6W']: return 'six-wheeler';
      default: return '';
    }
  }

  getFlatNumberDisplay(): string {
    const flatNumber = typeof this.vehicle.flatId === 'string' ? undefined : this.vehicle.flatId.flatNumber;
    return flatNumber ?? '—';
  }

  getCreatedByDisplay(): string {
    const createdBy = this.vehicle.createdByUserId;
    if (!createdBy) return '—';
    if (typeof createdBy === 'object') {
      if ('name' in createdBy && createdBy.name) return createdBy.name;
      if ('email' in createdBy) return createdBy.email ?? 'N/A';
      return 'Unknown';
    }
    return `ID: ${this.truncateId(createdBy)}`;
  }

  private truncateId(id: string, maxLength: number = 8): string {
    if (id.length <= maxLength) return id;
    const start = id.substring(0, 4);
    const end = id.substring(id.length - 4);
    return `${start}...${end}`;
  }

  toggleSelection(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selected = checked;
    this.selectedChange.emit(checked);
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.edit.emit(this.vehicle);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.vehicle);
  }
}