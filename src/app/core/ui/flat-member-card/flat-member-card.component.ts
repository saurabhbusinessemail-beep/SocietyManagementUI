import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { IFlat, IFlatMember, ISociety, IUIControlConfig, IUser } from '../../../interfaces';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SocietyRoles } from '../../../types';
import { ResidingTypes } from '../../../constants';

@Component({
  selector: 'ui-flat-member-card',
  templateUrl: './flat-member-card.component.html',
  styleUrl: './flat-member-card.component.scss'
})
export class FlatMemberCardComponent {

  @Input() member!: IFlatMember;
  @Input() viewerRole: 'admin' | SocietyRoles.manager | SocietyRoles.owner | SocietyRoles.tenant | SocietyRoles.member = SocietyRoles.owner;
  @Input() showDelete = false;
  @Output() deleteMember = new EventEmitter<IFlatMember>();
  @Output() moveInMember = new EventEmitter<void>();
  @Output() moveOutMember = new EventEmitter<Date>();

  get memberUser(): IUser | undefined {
    return typeof this.member.userId === 'string' ? undefined : this.member.userId;
  }

  get society(): ISociety | undefined {
    return typeof this.member.societyId !== 'string' ? this.member.societyId : undefined
  }

  get flat(): IFlat | undefined {
    return typeof this.member.flatId !== 'string' ? this.member.flatId : undefined
  }

  get isAdminView(): boolean {
    return this.viewerRole === SocietyRoles.owner;
  }

  get isTenant(): boolean {
    return this.member.residingType as string === SocietyRoles.tenant;
  }

  get statusClass(): string {
    return `status-${this.member.status}`;
  }

  leaseEnd = new FormControl<Date | null>(new Date());
  endDatePopupRef?: MatDialogRef<any>;
  leaseEndConfig: IUIControlConfig = {
    id: 'leaseEnd',
    label: 'Lease End',
    placeholder: 'Enter Lease End',
    validations: [
      {
        name: 'required',
        validator: Validators.required
      }
    ],
    errorMessages: {
      required: 'Select a date'
    }
  };
  @ViewChild('endDate', { static: true }) endDateTemplate!: TemplateRef<any>;

  get showMoveOut(): boolean {
    return !this.member.leaseEnd && this.viewerRole === 'owner' && this.member.status === 'active' && this.member.residingType === ResidingTypes.Tenant
  }

  get showMoveIn(): boolean {
    const startDate = (this.member.leaseStart ? new Date(this.member.leaseStart) : new Date());
    const endDate = (this.member.leaseEnd ? new Date(this.member.leaseEnd) : new Date());
    const today = new Date();
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const isOverlap = startDate <= today && today >= endDate;

    return isOverlap && this.viewerRole === 'owner' && this.member.status === 'active' && this.member.residingType !== ResidingTypes.Tenant
  }

  constructor(private dialog: MatDialog) { }

  onDeleteClick(): void {
    this.deleteMember.emit(this.member);
  }

  onMoveInClick(): void {
    this.moveInMember.emit()
  }

  onMouveOutClick(): void {
    this.endDatePopupRef = this.dialog.open(this.endDateTemplate)
  }

  moveOut() {
    const endDate = this.leaseEnd.value;
    if (!endDate) return;

    this.moveOutMember.emit(endDate);
    this.endDatePopupRef?.close();
  }

  cancel() {
    this.endDatePopupRef?.close();
  }
}
