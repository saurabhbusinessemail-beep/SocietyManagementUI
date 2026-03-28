import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IFlatMember } from '../../../interfaces';

@Component({
  selector: 'ui-my-flat-member-card',
  templateUrl: './my-flat-member-card.component.html',
  styleUrls: ['./my-flat-member-card.component.scss']
})
export class MyFlatMemberCardComponent {
  @Input() member!: IFlatMember;
  @Input() showEdit = false;
  @Input() showDelete = false;
  @Input() selectMode = false;
  @Input() selected = false;
  @Input() plan?: { name: string; price: number; status: string }; // optional plan data

  @Output() edit = new EventEmitter<IFlatMember>();
  @Output() delete = new EventEmitter<IFlatMember>();
  @Output() selectedChange = new EventEmitter<boolean>();
  @Output() clicked = new EventEmitter<void>();

  // --- Helper methods for avatar and truncation ---

  truncateText(text: string, maxLength: number = 12): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  getAvatarColor(): string {
    const initials = this.getUserInitials();
    if (!initials || initials === '?') return '#6B6880';
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - color.length) + color;
  }

  getAvatarBgColor(): string {
    return this.getAvatarColor() + '18'; // 10% opacity
  }

  // --- Existing helper methods (preserved) ---

  getUserInitials(): string {
    const user = this.member.userId;
    if (user && typeof user === 'object' && 'name' in user && user.name) {
      const parts = user.name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    return '?';
  }

  getUserName(): string {
    const user = this.member.userId;
    if (user && typeof user === 'object' && 'name' in user && user.name) {
      return user.name;
    }
    if (user && typeof user === 'object' && 'email' in user && user.email) {
      return user.email;
    }
    return 'Unknown';
  }

  getContact(): string {
    return this.member.contact || '—';
  }

  getFlatNumber(): string {
    const flat = this.member.flatId;
    if (flat && typeof flat === 'object' && 'flatNumber' in flat) {
      return flat.flatNumber;
    }
    return '—';
  }

  getFlatType(): string {
    const flat = this.member.flatId;
    if (flat && typeof flat === 'object' && 'flatType' in flat && flat.flatType) {
      return flat.flatType;
    }
    return '';
  }

  getFloor(): string {
    const flat = this.member.flatId;
    if (flat && typeof flat === 'object' && 'floor' in flat && flat.floor !== undefined) {
      return String(flat.floor);
    }
    return '';
  }

  getFlatExtra(): string {
    const type = this.getFlatType();
    const floor = this.getFloor();
    if (type && floor) return `${type} · Floor ${floor}`;
    if (type) return type;
    if (floor) return `Floor ${floor}`;
    return '';
  }

  getSocietyName(): string {
    const society = this.member.societyId;
    if (society && typeof society === 'object' && 'societyName' in society) {
      return society.societyName;
    }
    return '—';
  }

  getSocietyFlatsCount(): number {
    const society = this.member.societyId;
    if (society && typeof society === 'object' && 'numberOfFlats' in society) {
      return society.numberOfFlats;
    }
    return 0;
  }

  getDocumentList(): any[] {
    return this.member.documents || [];
  }

  getDocumentCount(): number {
    return this.getDocumentList().length;
  }

  getDocumentDisplayName(doc: any): string {
    // Assuming document has a name or filename property
    return doc.name || doc.filename || 'doc';
  }

  
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
