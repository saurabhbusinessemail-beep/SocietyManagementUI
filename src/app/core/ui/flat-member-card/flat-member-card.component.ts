import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { IFlat, IFlatMember, ISociety, IUIControlConfig } from '../../../interfaces';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'ui-flat-member-card',
  templateUrl: './flat-member-card.component.html',
  styleUrl: './flat-member-card.component.scss'
})
export class FlatMemberCardComponent {

  @Input() member!: IFlatMember;
  @Input() viewerRole: 'admin' | 'manager' | 'owner' = 'owner';
  @Output() deleteMember = new EventEmitter<IFlatMember>();
  @Output() moveOutMember = new EventEmitter<Date>();


  get society(): ISociety | undefined {
    return typeof this.member.societyId !== 'string' ? this.member.societyId : undefined
  }

  get flat(): IFlat | undefined {
    return typeof this.member.flatId !== 'string' ? this.member.flatId : undefined
  }

  get isAdminView(): boolean {
    return this.viewerRole === 'owner';
  }

  get isTenant(): boolean {
    return this.member.residingType === 'Tenant';
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

  constructor(private dialog: MatDialog) { }

  onDeleteClick(): void {
    this.deleteMember.emit(this.member);
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
