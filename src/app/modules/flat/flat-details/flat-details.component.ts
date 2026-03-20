import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SocietyService } from '../../../services/society.service';
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
  IConfirmationPopupDataConfig,
  ICurrentPlanResponse,
  IPricingFeature
} from '../../../interfaces';
import { ComplaintService } from '../../../services/complaint.service';
import { GateEntryService } from '../../../services/gate-entry.service';
import { GatePassService } from '../../../services/gate-pass.service';
import { LoginService } from '../../../services/login.service';
import { WindowService } from '../../../services/window.service';
import { PricingPlanService } from '../../../services/pricing-plan.service';
import { FEATURES, ResidingTypes } from '../../../constants';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VehicleService } from '../../../services/vehicle.service';

@Component({
  selector: 'app-flat-details',
  templateUrl: './flat-details.component.html',
  styleUrls: ['./flat-details.component.scss']
})
export class FlatDetailsComponent implements OnInit, OnDestroy {

  flatMemberId?: string;
  flatMember?: IFlatMember;
  myProfile?: IMyProfile;
  currentPlan?: ICurrentPlanResponse;

  @ViewChild('confirmationTemplate') confirmationTemplate!: TemplateRef<any>;
  currentDialogRef: MatDialogRef<any> | null = null;
  confirmationDialogData = {
    message: '',
    note: '',
    showVaccant: false,
    showSelf: false,
    showTenant: false
  }

  // Feature availability flags
  membersFeatureAvailable: boolean = false; // Added members feature flag
  vehiclesFeatureAvailable: boolean = false;
  parkingFeatureAvailable: boolean = false;
  complaintsFeatureAvailable: boolean = false;
  gateEntriesFeatureAvailable: boolean = false;
  gatePassesFeatureAvailable: boolean = false;
  featuresLoaded: boolean = false;

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
    private planService: PricingPlanService,
    private dialog: MatDialog,
    private vehicleService: VehicleService
  ) { }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();
    this.flatMemberId = this.route.snapshot.paramMap.get('flatMemberId')!;
    if (!this.flatMemberId) {
      this.router.navigateByUrl('/myflats');
      return;
    }

    this.loadFlatMember(this.flatMemberId);
  }

  getPlanDurationDisplay(): string {
    if (!this.currentPlan?.selectedDuration) return '';

    const { value, unit } = this.currentPlan.selectedDuration;
    if (unit === 'months') {
      return `${value} Month${value > 1 ? 's' : ''}`;
    }
    return `${value} Year${value > 1 ? 's' : ''}`;
  }

  getPlanRemainingDays(): number {
    if (!this.currentPlan?.usage?.remainingDays) return 0;
    return this.currentPlan.usage.remainingDays;
  }

  loadFlatMember(flatMemberId: string): void {
    this.societyService.getFlatMemberDetails(flatMemberId)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.flatMember = response;

          // Get societyId from flat member
          const societyId = typeof this.flatMember.societyId === 'string'
            ? this.flatMember.societyId
            : this.flatMember.societyId._id;

          // Load current plan to check feature availability
          this.loadCurrentPlan(societyId);
        },
        error: (err) => {
          console.error('Failed to load flat member', err);
          this.featuresLoaded = true; // Set to true to hide loading state
        }
      });
  }

  loadCurrentPlan(societyId: string): void {
    this.planService.getCurrentPlan(societyId)
      .pipe(take(1))
      .subscribe({
        next: (response: ICurrentPlanResponse | null) => {
          this.currentPlan = response || undefined;

          // Check feature availability from current plan
          if (this.currentPlan?.planDetails?.features) {
            this.checkFeatureAvailability(this.currentPlan.planDetails.features);
          }

          // Now load data based on feature availability
          this.loadRelatedData();
          this.featuresLoaded = true;
        },
        error: (err) => {
          console.log('Error loading current plan');
          this.currentPlan = undefined;
          this.featuresLoaded = true;
          // Even without plan, load data (might be free tier with basic features)
          this.loadRelatedData();
        }
      });
  }

  /**
   * Check which features are available in the current plan
   */
  checkFeatureAvailability(features: IPricingFeature[]): void {
    // Check features using keys from FEATURES enum
    this.membersFeatureAvailable = features.some(f =>
      f.key === FEATURES.FLAT_MEMBER_MANAGEMENT && f.included === true
    );

    this.vehiclesFeatureAvailable = features.some(f =>
      f.key === FEATURES.VEHICLE && f.included === true
    );

    this.parkingFeatureAvailable = features.some(f =>
      f.key === FEATURES.PARKING && f.included === true
    );

    this.complaintsFeatureAvailable = features.some(f =>
      f.key === FEATURES.COMPLAINTS && f.included === true
    );

    this.gateEntriesFeatureAvailable = features.some(f =>
      f.key === FEATURES.GATE_ENTRIES && f.included === true
    );

    this.gatePassesFeatureAvailable = features.some(f =>
      f.key === FEATURES.SMART_GATE_PASS && f.included === true
    );

    console.log('Feature availability:', {
      members: this.membersFeatureAvailable,
      vehicles: this.vehiclesFeatureAvailable,
      parking: this.parkingFeatureAvailable,
      complaints: this.complaintsFeatureAvailable,
      gateEntries: this.gateEntriesFeatureAvailable,
      gatePasses: this.gatePassesFeatureAvailable
    });
  }

  /**
   * Fetch all related data for the flat based on feature availability
   */
  private loadRelatedData(): void {
    if (!this.flatMember) return;

    const flatId = typeof this.flatMember.flatId === 'string'
      ? this.flatMember.flatId
      : this.flatMember.flatId._id;

    const societyId = typeof this.flatMember.societyId === 'string'
      ? this.flatMember.societyId
      : this.flatMember.societyId._id;

    // Load members only if feature is available
    if (this.membersFeatureAvailable) {
      this.getFlatMembers(societyId, flatId);
    }

    // Load data only for features that are available
    if (this.complaintsFeatureAvailable) {
      this.getComplaints(societyId, flatId);
    }

    if (this.gateEntriesFeatureAvailable) {
      this.getGateEntries(societyId, flatId);
    }

    if (this.gatePassesFeatureAvailable) {
      this.getGatePasses(societyId, flatId);
    }

    // For vehicles and parking, check individual features
    if (this.vehiclesFeatureAvailable) {
      this.getVehicles(societyId, flatId);
    }

    if (this.parkingFeatureAvailable) {
      this.getParkings(societyId, flatId);
    }
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
          this.complaints = response.data || [];
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

  getVehicles(societyId: string, flatId: string) {
    this.vehicles = [];
    this.vehicleService.getVehicles(flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.vehicles = response.data || [];
        }
      });
  }

  getParkings(societyId: string, flatId: string) {
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
    return `ID: ${createdBy.substring(0, 6)}...`;
  }

  getPlanDisplayName(): string {
    return this.currentPlan?.planDetails?.name || 'No Plan';
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
    this.resetDialogData();
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

    if (this.flatMember.residingType === ResidingTypes.Self) {
      this.societyService.moveOutOwner(this.flatMember._id)
        .pipe(take(1))
        .subscribe({
          next: response => {
            if (!response.success) return;

            if (this.flatMember) this.loadFlatMember(this.flatMember._id);
          },
          complete: () => this.cancelResidingTypeChange()
        });
      return;
    }

    if (this.flatMember.residingType === ResidingTypes.Tenant) {
      this.societyService.moveOutTenant(this.flatMember._id)
        .pipe(take(1))
        .subscribe({
          next: response => {
            if (!response.success) return;
            if (this.flatMember) this.loadFlatMember(this.flatMember._id);
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
          if (this.flatMember) this.loadFlatMember(this.flatMember._id);
        },
        complete: () => this.cancelResidingTypeChange()
      });
  }

  manageResidents() {
    if (!this.membersFeatureAvailable) return;
    this.router.navigateByUrl('/members/list');
  }

  manageVehicles() {
    if (!this.vehiclesFeatureAvailable || !this.flatMember) return;

    const flatId = typeof this.flatMember.flatId === 'string'
      ? this.flatMember.flatId
      : this.flatMember.flatId._id;

    this.router.navigate(['vehicles', flatId, 'list']);
  }

  manageComplaints() {
    if (!this.complaintsFeatureAvailable) return;
    this.router.navigateByUrl('/complaints/list');
  }

  manageGateEntries() {
    if (!this.gateEntriesFeatureAvailable) return;
    this.router.navigateByUrl('/visitors/list');
  }

  manageGatePasses() {
    if (!this.gatePassesFeatureAvailable) return;
    this.router.navigateByUrl('/gatepass/list');
  }

  gotoPlanUpgrade() {
    if (!this.flatMember) return;

    const societyId = typeof this.flatMember.societyId === 'string'
      ? this.flatMember.societyId
      : this.flatMember.societyId._id;

    this.router.navigate(['society/current-plan', societyId]);
  }

  ngOnDestroy(): void {
    this.currentDialogRef?.close();
  }
}