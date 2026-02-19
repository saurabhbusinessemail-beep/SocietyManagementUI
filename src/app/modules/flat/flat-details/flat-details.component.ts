import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { SocietyService } from '../../../services/society.service'; // adjust path as needed
import {
  IFlatMember,
  IFlat,
  ISociety,
  IBuilding,
  IUser,
  IComplaint,
  IGateEntry,
  IGatePass,
  IVehicle,
  IParking,
  IMyProfile,
  IConfirmationPopupDataConfig
} from '../../../interfaces'; // adjust path as needed
import { ComplaintService } from '../../../services/complaint.service';
import { GateEntryService } from '../../../services/gate-entry.service';
import { GatePassService } from '../../../services/gate-pass.service';
import { LoginService } from '../../../services/login.service';
import { WindowService } from '../../../services/window.service';
import { ResidingTypes } from '../../../constants';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-flat-details',
  templateUrl: './flat-details.component.html',
  styleUrls: ['./flat-details.component.scss']
})
export class FlatDetailsComponent implements OnInit, OnDestroy {

  flatMemberId?: string;
  flatMember?: IFlatMember;
  myProfile?: IMyProfile;


  @ViewChild('confirmationTemplate') confirmationTemplate!: TemplateRef<any>;
  currentDialogRef: MatDialogRef<any> | null = null;
  confirmationDialogData = {
    message: '',
    note: '',
    showVaccant: false,
    showSelf: false,
    showTenant: false
  }

  // Related data arrays (populated via API calls)
  members: IFlatMember[] = [];           // other residents of the same flat
  complaints: IComplaint[] = [];
  gateEntries: IGateEntry[] = [];
  gatePasses: IGatePass[] = [];
  vehicles: IVehicle[] = [];
  parkings: IParking[] = [];

  get pageTitle(): string {
    if (this.flatMember && typeof this.flatMember.flatId !== 'string') {
      const flat = this.flatMember.flatId;
      return `Flat ${flat.flatNumber} · Floor ${flat.floor}`;
    }
    return 'Flat Details';
  }

  get showFlatMemberProfile(): boolean {
    if (!this.myProfile || !this.flatMember) return true;

    const flatMemberUserId = !this.flatMember.userId || typeof this.flatMember.userId === 'string' ? this.flatMember.userId : this.flatMember.userId._id;
    if (!flatMemberUserId) return false;

    if (flatMemberUserId === this.myProfile.user._id) return false;

    return true;
  }

  get hasMultiBuilding(): boolean {
    if (!this.flatMember || typeof this.flatMember.societyId === 'string') return false;

    if (this.flatMember.societyId.numberOfBuildings <= 1) return false;

    return true;
  }

  get residingButtonText(): string {
    const residingType = this.flatMember?.residingType ?? ''
    return this.windowService.mode.value === 'mobile' ? residingType : 'Residing: ' + residingType
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private societyService: SocietyService,
    private complaintService: ComplaintService,
    private gateEntryService: GateEntryService,
    private gatepassService: GatePassService,
    private loginService: LoginService,
    private windowService: WindowService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();
    this.flatMemberId = this.route.snapshot.paramMap.get('flatMemberId')!;
    if (!this.flatMemberId) {
      this.router.navigateByUrl('/myflats');
      return;
    }

    this.loadFlatMember(this.flatMemberId);
    // After loading flat member, you can fetch related data using its flatId/societyId
    // e.g., this.loadRelatedData();
  }

  loadFlatMember(flatMemberId: string): void {
    this.societyService.getFlatMemberDetails(flatMemberId)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.flatMember = response;
          // Once flat member is loaded, fetch related data
          this.loadRelatedData();
        },
        error: (err) => {
          console.error('Failed to load flat member', err);
          // Optionally navigate back or show error
        }
      });
  }

  /**
   * Fetch all related data for the flat (members, complaints, gate entries, etc.)
   * You'll need to implement these service methods according to your API.
   */
  private loadRelatedData(): void {
    if (!this.flatMember) return;

    const flatId = typeof this.flatMember.flatId === 'string'
      ? this.flatMember.flatId
      : this.flatMember.flatId._id;

    const societyId = typeof this.flatMember.societyId === 'string'
      ? this.flatMember.societyId
      : this.flatMember.societyId._id;

    // Example calls – replace with actual service methods
    this.getFlatMembers(societyId, flatId);
    this.getComplaints(societyId, flatId)
    this.getGateEntries(societyId, flatId);
    this.getGatePasses(societyId, flatId);
    // this.societyService.getVehiclesByFlat(flatId).subscribe(data => this.vehicles = data);
    this.getGateParkings(societyId, flatId);
  }

  getFlatMembers(societyId: string, flatId: string) {
    this.societyService.myFlatMembers(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.members = response.data;
        }
      })
  }

  getComplaints(societyId: string, flatId: string) {
    this.complaintService.getComplaints(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.complaints = response.data
        }
      });
  }

  getGateEntries(societyId: string, flatId: string) {
    this.gateEntryService.getAllMyGateEntries(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.gateEntries = response.data;
        }
      });
  }

  getGatePasses(societyId: string, flatId: string) {
    this.gatepassService.getGattePasses(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.gatePasses = response.data;
        }
      });
  }

  getGateParkings(societyId: string, flatId: string) {
    this.societyService.getParkingsByFlat(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.parkings = response.data;
        }
      })
  }

  // ---------- Helper methods for template ----------

  getflat(): IFlat | undefined {
    return typeof this.flatMember?.flatId === 'string'
      ? undefined
      : this.flatMember?.flatId;
  }

  getSociety(): ISociety | undefined {
    return typeof this.flatMember?.societyId === 'string'
      ? undefined
      : this.flatMember?.societyId;
  }

  getInitials(name: string): string {
    return name?.charAt(0).toUpperCase() || '?';
  }

  getBuildingDisplay(): string {
    const flat = this.getflat();
    if (!flat || typeof flat.buildingId === 'string') return '—';
    return `Building ${flat.buildingId?.buildingNumber}`;
  }

  getCreatedByDisplay(): string {
    const createdBy = this.flatMember?.createdByUserId;
    if (!createdBy) return '—';
    if (typeof createdBy === 'object') {
      if ('name' in createdBy && createdBy.name) return createdBy.name;
      if ('email' in createdBy) return createdBy.email ?? 'N/A';
      return 'Unknown';
    }
    // It's a string ID – show truncated
    return `ID: ${createdBy.substring(0, 6)}...`;
  }

  resetDialogData(): void {
    if (!this.flatMember) return;

    switch (this.flatMember.residingType) {
      case ResidingTypes.Self:
        this.confirmationDialogData.message = 'You are currently residing in this flat. You can either set it as vaccant or add a tenant.';
        this.confirmationDialogData.note = 'All current flat members will be deactivated.';
        this.confirmationDialogData.showSelf = false;
        this.confirmationDialogData.showTenant = true;
        this.confirmationDialogData.showVaccant = true;
        break;
      case ResidingTypes.Tenant:
        this.confirmationDialogData.message = 'You can either set the flat as vaccant or reside yourself. The current tenant will be moved out if you proceed';
        this.confirmationDialogData.note = 'All current flat members will be deactivated.';
        this.confirmationDialogData.showSelf = true;
        this.confirmationDialogData.showTenant = false;
        this.confirmationDialogData.showVaccant = true;
        break;
      case ResidingTypes.Vacant:
        this.confirmationDialogData.message = 'Currently no one is residing in your flat. You can either reside yourself or add a tenant.';
        this.confirmationDialogData.showSelf = true;
        this.confirmationDialogData.showTenant = true;
        this.confirmationDialogData.showVaccant = false;
    }
  }

  handleChangeResidingTypeClick() {
    const popupConfig = this.resetDialogData();

    this.currentDialogRef = this.dialog.open(this.confirmationTemplate);
  }

  cancelResidingTypeChange() {
    this.currentDialogRef?.close();
  }

  handleTenantClick() {
    this.cancelResidingTypeChange();
    this.router.navigateByUrl('/tenants/add');
  }

  handleVaccantClick() {
    if (!this.flatMember) return;

    // If current status is OWNER then only disable current members
    if (this.flatMember.residingType === ResidingTypes.Self) {
      this.societyService.moveOutSelf(this.flatMember._id)
        .pipe(take(1))
        .subscribe({
          next: response => {
            if (!response.success) return;

            this.flatMember = response.data;
          },
          complete: () => this.cancelResidingTypeChange()
        });
      return;
    }

    // if current status is TENANT then move out tenant
    if (this.flatMember.residingType === ResidingTypes.Tenant) {
      this.societyService.moveOutTenant(this.flatMember._id)
        .pipe(take(1))
        .subscribe({
          next: response => {
            if (!response.success) return;

            this.flatMember = response.data;
          },
          complete: () => this.cancelResidingTypeChange()
        });
      return;
    }

  }

  handleSelfClick() {
    if (!this.flatMember) return;

    this.societyService.moveInSelf(this.flatMember._id)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.flatMember = response.data;
        },
        complete: () => this.cancelResidingTypeChange()
      });
    // If current is VACCANT then activate all members and change residing type to self
    // if current is TENANT then vaccate tenant and then activate all members and change residing type to self
  }

  manageResidents() {
    this.router.navigateByUrl('/members/list')
  }

  manageVehicles() {
    if (!this.flatMember) return;

    const flatId = typeof this.flatMember.flatId === 'string' ? this.flatMember.flatId : this.flatMember.flatId._id

    this.router.navigate(['vehicles', flatId, 'list']);
  }

  manageComplaints() {
    this.router.navigateByUrl('/complaints/list')
  }

  manageGateEntries() {
    this.router.navigateByUrl('/visitors/list')
  }

  manageGatePasses() {
    this.router.navigateByUrl('/gatepass/list')
  }

  ngOnDestroy(): void {
    // this.currentDialogRef.cle
  }
}