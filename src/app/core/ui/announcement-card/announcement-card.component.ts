import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IAnnouncement, IUser, ISociety } from '../../../interfaces';
import { SocietyRoles } from '../../../types';

@Component({
  selector: 'ui-announcement-card',
  templateUrl: './announcement-card.component.html',
  styleUrl: './announcement-card.component.scss'
})
export class AnnouncementCardComponent {

  @Input() announcement!: IAnnouncement;
  @Input() viewerRole: 'admin' | SocietyRoles = SocietyRoles.member;
  @Output() deleteAnnouncement = new EventEmitter<IAnnouncement>();
  @Output() editAnnouncement = new EventEmitter<IAnnouncement>();
  @Output() viewAnnouncement = new EventEmitter<IAnnouncement>();
  @Output() pinAnnouncement = new EventEmitter<IAnnouncement>();

  get createdByUser(): IUser | undefined {
    return typeof this.announcement.createdByUserId === 'string' ? undefined : this.announcement.createdByUserId;
  }

  get society(): ISociety | undefined {
    return typeof this.announcement.societyId !== 'string' ? this.announcement.societyId : undefined;
  }

  get isAdminView(): boolean {
    return this.viewerRole === SocietyRoles.societyadmin || this.viewerRole === SocietyRoles.manager || this.viewerRole === 'admin';
  }

  get statusClass(): string {
    return `status-${this.announcement.status}`;
  }

  get priorityClass(): string {
    return `priority-${this.announcement.priority}`;
  }

  get categoryClass(): string {
    return `category-${this.announcement.category}`;
  }

  get isExpired(): boolean {
    if (!this.announcement.expiryDate) return false;
    return new Date(this.announcement.expiryDate) < new Date();
  }

  get isPublished(): boolean {
    return this.announcement.status === 'published' && !this.isExpired;
  }

  getExcerpt(content: string, limit: number = 120): string {
    if (content.length <= limit) return content;
    return content.substring(0, limit) + '...';
  }

  onDeleteClick(): void {
    this.deleteAnnouncement.emit(this.announcement);
  }

  onEditClick(): void {
    this.editAnnouncement.emit(this.announcement);
  }

  onViewClick(): void {
    this.viewAnnouncement.emit(this.announcement);
  }

  onPinClick(): void {
    this.pinAnnouncement.emit(this.announcement);
  }
}