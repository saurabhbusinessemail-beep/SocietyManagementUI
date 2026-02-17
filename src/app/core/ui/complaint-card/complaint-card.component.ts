import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IComplaint, IFlat, ISociety, IUser } from '../../../interfaces';

@Component({
  selector: 'ui-complaint-card',
  templateUrl: './complaint-card.component.html',
  styleUrls: ['./complaint-card.component.scss']
})
export class ComplaintCardComponent {
  @Input() complaint!: IComplaint;
  @Input() showEdit = false;
  @Input() showDelete = false;
  @Input() selectMode = false;
  @Input() selected = false;

  // Permission flags for status change buttons
  @Input() canApprove = false;
  @Input() canReject = false;
  @Input() canMoveToProgress = false;
  @Input() canMarkResolved = false;
  @Input() canClose = false;

  @Output() edit = new EventEmitter<IComplaint>();
  @Output() delete = new EventEmitter<IComplaint>();
  @Output() selectedChange = new EventEmitter<boolean>();
  @Output() statusChange = new EventEmitter<string>();

  getPriorityClass(): string {
    return this.complaint.priority.toLowerCase();
  }

  getStatusClass(): string {
    return this.complaint.status.toLowerCase().replace(/_/g, '-');
  }

  getFlatDisplay(): string {
    const flat = this.complaint.flatId;
    if (!flat) return '—';
    if (typeof flat === 'object' && 'flatNumber' in flat) {
      return `Flat ${flat.flatNumber}`;
    }
    return `ID: ${this.truncateId(flat)}`;
  }

  getSocietyDisplay(): string {
    const society = this.complaint.societyId;
    if (!society) return '—';
    if (typeof society === 'object' && 'societyName' in society) {
      return society.societyName;
    }
    return `ID: ${this.truncateId(society)}`;
  }

  getAssignedToDisplay(): string {
    const assigned = this.complaint.assignedTo;
    if (!assigned) return 'Unassigned';
    if (typeof assigned === 'object') {
      if ('name' in assigned && assigned.name) return assigned.name;
      if ('email' in assigned) return assigned.email ?? 'N/A';
      return 'Unknown';
    }
    return `ID: ${this.truncateId(assigned)}`;
  }

  getCreatedByDisplay(): string {
    const createdBy = this.complaint.createdByUserId;
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
    this.edit.emit(this.complaint);
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.complaint);
  }

  onChangeStatus(status: string, event: MouseEvent): void {
    event.stopPropagation();
    this.statusChange.emit(status);
  }
}