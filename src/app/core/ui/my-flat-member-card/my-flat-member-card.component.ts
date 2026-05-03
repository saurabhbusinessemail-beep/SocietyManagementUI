import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IBuilding, IMyFlatResponse, IUser } from '../../../interfaces';

@Component({
  selector: 'ui-my-flat-member-card',
  templateUrl: './my-flat-member-card.component.html',
  styleUrls: ['./my-flat-member-card.component.scss']
})
export class MyFlatMemberCardComponent {
  @Input() member!: IMyFlatResponse;
  @Input() showEdit = false;
  @Input() showDelete = false;
  @Input() selectMode = false;
  @Input() selected = false;
  @Input() plan?: { name: string; price: number; status: string };

  @Output() edit = new EventEmitter<IMyFlatResponse>();
  @Output() delete = new EventEmitter<IMyFlatResponse>();
  @Output() selectedChange = new EventEmitter<boolean>();
  @Output() clicked = new EventEmitter<void>();

  // --------------------------------------------------------------------------
  // Computed properties for user relationships
  // --------------------------------------------------------------------------
  get currentUser(): IUser | null {
    return (this.member.userId && typeof this.member.userId === 'object') ? this.member.userId as IUser : null;
  }

  get residingType(): string {
    const flat = this.member.flatId;
    if (flat && typeof flat === 'object' && 'residingType' in flat && flat.residingType) {
      return flat.residingType;
    }
    return this.member.residingType || 'Vacant';
  }

  get ownerUser(): IUser | null {
    if (this.member.owner?.userId && typeof this.member.owner.userId === 'object') {
      return this.member.owner.userId as IUser;
    }
    return null;
  }

  get tenantUser(): IUser | null {
    if (this.member.tenant?.userId && typeof this.member.tenant.userId === 'object') {
      return this.member.tenant.userId as IUser;
    }
    return null;
  }

  get isOwnerWithTenant(): boolean {
    return this.member.isOwner && this.residingType === 'Tenant';
  }

  get isTenantOrMember(): boolean {
    return this.member.isTenant || this.member.isMember || this.member.isTenantMember;
  }

  get showOwnerInfo(): boolean {
    return (this.isTenantOrMember || this.member.isTenantMember) && !!this.ownerUser;
  }

  // Only show tenant info if the user is the owner or a tenant member, 
  // and NOT if the user is a previous tenant (to hide the other tenant's details)
  get showTenantInfo(): boolean {
    if (this.isPreviousTenantWithOtherTenant) return false;
    return (this.isOwnerWithTenant || this.member.isTenantMember) && !!this.tenantUser;
  }

  // --------------------------------------------------------------------------
  // Context messages (vacant / self / tenant / previous tenant / other tenant)
  // --------------------------------------------------------------------------
  get showVacantMessage(): boolean {
    return this.residingType === 'Vacant';
  }

  get showSelfMessage(): boolean {
    // Owner living in own flat (Self) AND user is not a tenant
    return this.member.isOwner && this.residingType === 'Self';
  }

  get showMemberMessage(): boolean {
    // Owner living in own flat (Self) AND user is not a tenant
    return this.member.isMember && this.residingType === 'Self';
  }

  get showTenantMessage(): boolean {
    // Current tenant: user is tenant and currently residing (residingType === 'Tenant')
    // And there is no other tenant record (or the tenant record matches the user)
    return this.member.isTenant && this.residingType === 'Tenant' && !this.isPreviousTenantWithOtherTenant;
  }

  get showTenantExpiredMessage(): boolean {
    // Previous tenant, owner has moved in (residingType === 'Self')
    return this.member.isTenant && this.residingType === 'Self';
  }

  get showOtherTenantMessage(): boolean {
    // Previous tenant, another tenant is currently living (residingType === 'Tenant' but different tenant)
    return this.isPreviousTenantWithOtherTenant;
  }

  // Check if the user is a previous tenant and another tenant is currently living
  get isPreviousTenantWithOtherTenant(): boolean {
    if (!this.member.isTenant) return false;
    if (!this.member.tenant) return false;
    const currentUserId = this.currentUser?._id;
    const tenantUserId = this.tenantUser?._id;
    return !!currentUserId && !!tenantUserId && currentUserId !== tenantUserId;
  }

  // --------------------------------------------------------------------------
  // Status badge class & disabled state
  // --------------------------------------------------------------------------
  get statusBadgeClass(): string {
    switch (this.residingType) {
      case 'Self': return 'status-self';
      case 'Tenant': return 'status-tenant';
      case 'Vacant': return 'status-vacant';
      default: return '';
    }
  }

  get statusBadgeText(): string {
    switch (this.residingType) {
      case 'Self': return 'Self';
      case 'Tenant': return 'Tenant';
      case 'Vacant': return 'Vacant';
      default: return this.residingType || '';
    }
  }

  get isDisabled(): boolean {
    return this.member.status !== 'active';
  }

  // --------------------------------------------------------------------------
  // Avatar helpers
  // --------------------------------------------------------------------------
  getAvatarColor(user?: IUser | null): string {
    const initials = this.getUserInitials(user);
    if (!initials || initials === '?') return '#6B6880';
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - color.length) + color;
  }

  getAvatarBgColor(user?: IUser | null): string {
    return this.getAvatarColor(user) + '18';
  }

  getUserInitials(user?: IUser | null): string {
    const targetUser = user || this.currentUser;
    if (targetUser && targetUser.name) {
      const parts = targetUser.name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return targetUser.name.substring(0, 2).toUpperCase();
    }
    return '?';
  }

  getUserName(user?: IUser | null): string {
    const targetUser = user || this.currentUser;
    if (targetUser && targetUser.name) return targetUser.name;
    if (targetUser && targetUser.email) return targetUser.email;
    return 'Unknown';
  }

  getContact(user?: IUser | null): string {
    if (user && user.phoneNumber) return user.phoneNumber;
    return this.member.contact || '—';
  }

  // --------------------------------------------------------------------------
  // Flat & Society info
  // --------------------------------------------------------------------------
  getFlatNumber(): string {
    const flat = this.member.flatId;
    if (flat && typeof flat === 'object' && 'flatNumber' in flat) {
      return flat.flatNumber;
    }
    return '—';
  }

  getFloor(): string {
    const flat = this.member.flatId;
    if (flat && typeof flat === 'object' && 'floor' in flat && flat.floor !== undefined) {
      return String(flat.floor);
    }
    return '';
  }

  getBuildingName(): string {
    const flat = this.member.flatId;
    if (flat && typeof flat === 'object' && 'buildingId' in flat && flat.buildingId) {
      const building = flat.buildingId;
      if (building && typeof building === 'object' && 'buildingNumber' in building) {
        return building.buildingNumber;
      }
    }
    return '';
  }

  getSocietyName(): string {
    const society = this.member.societyId;
    if (society && typeof society === 'object' && 'societyName' in society) {
      return society.societyName;
    }
    return '—';
  }

  getSocietyBuildingsCount(): number {
    const society = this.member.societyId;
    if (society && typeof society === 'object' && 'numberOfBuildings' in society) {
      return society.numberOfBuildings;
    }
    return 0;
  }

  getSocietyFlatsCount(): number {
    const society = this.member.societyId;
    if (society && typeof society === 'object' && 'numberOfFlats' in society) {
      return society.numberOfFlats;
    }
    return 0;
  }

  // --------------------------------------------------------------------------
  // Lease details
  // --------------------------------------------------------------------------
  get leaseStartDate(): string {
    if (!this.member.leaseStart) return '';
    return new Date(this.member.leaseStart).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }

  get leaseEndDate(): string {
    if (!this.member.leaseEnd) return '';
    return new Date(this.member.leaseEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }

  // --------------------------------------------------------------------------
  // Documents
  // --------------------------------------------------------------------------
  getDocumentList(): any[] {
    return this.member.documents || [];
  }

  getDocumentCount(): number {
    return this.getDocumentList().length;
  }

  getDocumentDisplayName(doc: any): string {
    return doc.name || doc.filename || 'doc';
  }

  truncateText(text: string, maxLength: number = 12): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  // --------------------------------------------------------------------------
  // Event handlers (with disabled check)
  // --------------------------------------------------------------------------
  onCardClick(): void {
    if (!this.isDisabled) {
      this.clicked.emit();
    }
  }

  toggleSelection(event: Event): void {
    event.stopPropagation();
    if (!this.isDisabled) {
      const checked = (event.target as HTMLInputElement).checked;
      this.selected = checked;
      this.selectedChange.emit(checked);
    }
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isDisabled) {
      this.edit.emit(this.member);
    }
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isDisabled) {
      this.delete.emit(this.member);
    }
  }
}