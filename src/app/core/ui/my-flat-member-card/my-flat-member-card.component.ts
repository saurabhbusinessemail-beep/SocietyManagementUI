import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IFlatMember } from '../../../interfaces';

@Component({
  selector: 'ui-my-flat-member-card',
  templateUrl: './my-flat-member-card.component.html',
  styleUrl: './my-flat-member-card.component.scss'
})
export class MyFlatMemberCardComponent {
  @Input() member!: IFlatMember;
  @Input() showEdit = false;
  @Input() showDelete = false;
  @Input() selectMode = false;
  @Input() selected = false;

  @Output() edit = new EventEmitter<IFlatMember>();
  @Output() delete = new EventEmitter<IFlatMember>();
  @Output() selectedChange = new EventEmitter<boolean>();

  // Helper methods to resolve objects

  getFlatDisplay(): string {
    const flat = this.member.flatId;
    if (!flat) return '—';
    if (typeof flat === 'object' && 'flatNumber' in flat) {
      return `Flat ${flat.flatNumber}`;
    }
    return `ID: ${this.truncateId(flat)}`;
  }

  getSocietyDisplay(): string {
    const society = this.member.societyId;
    if (!society) return '—';
    if (typeof society === 'object' && 'societyName' in society) {
      return society.societyName;
    }
    return `ID: ${this.truncateId(society)}`;
  }

  getUserDisplay(): string {
    const user = this.member.userId;
    if (!user) return '—';
    if (typeof user === 'object') {
      if ('name' in user && user.name) return user.name;
      if ('email' in user) return user.email ?? 'N/A';
      return 'Unknown';
    }
    return `ID: ${this.truncateId(user)}`;
  }

  getCreatedByDisplay(): string {
    const createdBy = this.member.createdByUserId;
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
    this.edit.emit(this.member);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.member);
  }
}
