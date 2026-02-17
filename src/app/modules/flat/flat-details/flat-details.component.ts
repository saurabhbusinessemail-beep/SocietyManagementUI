import { Component, OnInit } from '@angular/core';
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
  IMyProfile
} from '../../../interfaces'; // adjust path as needed
import { ComplaintService } from '../../../services/complaint.service';
import { GateEntryService } from '../../../services/gate-entry.service';
import { GatePassService } from '../../../services/gate-pass.service';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-flat-details',
  templateUrl: './flat-details.component.html',
  styleUrls: ['./flat-details.component.scss']
})
export class FlatDetailsComponent implements OnInit {

  flatMemberId?: string;
  flatMember?: IFlatMember;
  myProfile?: IMyProfile;

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private societyService: SocietyService,
    private complaintService: ComplaintService,
    private gateEntryService: GateEntryService,
    private gatepassService: GatePassService,
    private loginService: LoginService
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

  manageResidents() {
    this.router.navigateByUrl('/members/list')
  }

  manageVehicles() {
    console.log('Manage vehicles');
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
}