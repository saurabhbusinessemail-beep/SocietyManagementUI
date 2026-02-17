import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IGatePass, ISociety, IFlat, IUser } from '../../../interfaces'; // adjust path

@Component({
  selector: 'ui-gate-pass-card',
  templateUrl: './gate-pass-card.component.html',
  styleUrls: ['./gate-pass-card.component.scss']
})
export class GatePassCardComponent {
  @Input() gatePass!: IGatePass;
  @Input() showDelete = false;
  @Input() selectMode = false;
  @Input() selected = false;

  @Output() delete = new EventEmitter<IGatePass>();
  @Output() showQR = new EventEmitter<IGatePass>();
  @Output() selectedChange = new EventEmitter<boolean>();

  getSocietyDisplay(): string {
    const society = this.gatePass.societyId;
    if (!society) return '—';
    if (typeof society === 'object' && 'societyName' in society) {
      return society.societyName;
    }
    return `ID: ${this.truncateId(society)}`;
  }

  getFlatDisplay(): string {
    const flat = this.gatePass.flatId;
    if (!flat) return '—';
    if (typeof flat === 'object' && 'flatNumber' in flat) {
      return `Flat ${flat.flatNumber}`;
    }
    return `ID: ${this.truncateId(flat)}`;
  }

  getUserDisplay(): string {
    const user = this.gatePass.userId;
    if (!user) return '—';
    if (typeof user === 'object') {
      if ('name' in user && user.name) return user.name;
      if ('email' in user) return user.email ?? 'N/A';
      return 'Unknown';
    }
    return `ID: ${this.truncateId(user)}`;
  }

  getCreatedByDisplay(): string {
    const createdBy = this.gatePass.createdByUserId;
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

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.gatePass);
  }

  onShowQR(event: MouseEvent): void {
    event.stopPropagation();
    this.showQR.emit(this.gatePass);
  }
}