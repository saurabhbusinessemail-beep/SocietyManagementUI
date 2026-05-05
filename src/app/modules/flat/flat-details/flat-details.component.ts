import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';

import { SocietyService } from '../../../services/society.service';
import {
  IFlatMember,
  IFlatMemberWithResidency,
  IFlat,
  ISociety,
  IComplaint,
  IGateEntry,
  IGatePass,
  IVehicle,
  IParking,
  IMyProfile,
  ICurrentPlanResponse,
  IMaintenancePayment,
  IMyFlatResponse
} from '../../../interfaces';
import { ComplaintService } from '../../../services/complaint.service';
import { GateEntryService } from '../../../services/gate-entry.service';
import { GatePassService } from '../../../services/gate-pass.service';
import { LoginService } from '../../../services/login.service';
import { WindowService } from '../../../services/window.service';
import { PricingPlanService } from '../../../services/pricing-plan.service';
import { FEATURES, PERMISSIONS, ResidingTypes } from '../../../constants';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VehicleService } from '../../../services/vehicle.service';
import { DialogService } from '../../../services/dialog.service';
import { MaintenanceService } from '../../../services/maintenance.service';
import { RentService } from '../../../services/rent.service';
import { FormControl } from '@angular/forms';
import { IRentPayment, IRentMonthlyReport } from '../../../interfaces';
import { CountryService } from '../../../services/country.service';
import { CurrencyService } from '../../../services/currency.service';
import { TenantDocumentService } from '../../../services/tenant-document.service';
import { ITenantDocument, ITenantDocumentStats } from '../../../interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-flat-details',
  templateUrl: './flat-details.component.html',
  styleUrls: ['./flat-details.component.scss']
})
export class FlatDetailsComponent implements OnInit, OnDestroy {

  flatMemberId?: string;
  flatMember?: IMyFlatResponse;
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
  tenantManagementFeatureAvailable: boolean = false;
  maintenanceFeatureAvailable: boolean = false;
  rentFeatureAvailable: boolean = false;

  // Related data arrays (populated via API calls)
  members: IFlatMemberWithResidency[] = [];           // other residents of the same flat
  complaints: IComplaint[] = [];
  gateEntries: IGateEntry[] = [];
  gatePasses: IGatePass[] = [];
  vehicles: IVehicle[] = [];
  parkings: IParking[] = [];
  tenants: IFlatMemberWithResidency[] = [];
  maintenancePayments: IMaintenancePayment[] = [];

  loadingFlatMember = true;
  loadingPlan = true;

  loadingOtherFlatMembers = true;
  loadingComplaints = true;
  laodingGateEntries = true;
  loadingGatePasses = true;
  loadingVehicles = true; //
  loadingParkings = true;
  loadingTenants = true;
  loadingMaintenance = true;
  recordingMaintenance = false;

  loadingDocuments = true;
  tenantDocuments: ITenantDocument[] = [];
  tenantDocumentStats: ITenantDocumentStats[] = [];

  // Rent state
  loadingRent = true;
  recordingRent = false;
  rentMonthlyReport?: IRentMonthlyReport;
  rentPayments: IRentPayment[] = [];

  // Maintenance payment form controls
  @ViewChild('maintenancePayTemplate') maintenancePayTemplate!: TemplateRef<any>;
  maintenanceDialogRef: MatDialogRef<any> | null = null;
  maintenanceAmount = new FormControl<number>(0);
  maintenanceDate = new FormControl<Date>(new Date());
  maintenancePaymentMethod = new FormControl<string>('');
  maintenancePaymentDetails = new FormControl<string>('');
  maintenanceMonth = new FormControl<number>(new Date().getMonth() + 1);
  maintenanceYear = new FormControl<number>(new Date().getFullYear());
  maintenanceNote = new FormControl<string>('');

  // Rent payment form controls
  @ViewChild('rentPayTemplate') rentPayTemplate!: TemplateRef<any>;
  rentDialogRef: MatDialogRef<any> | null = null;
  rentAmount = new FormControl<number>(0);
  rentDate = new FormControl<Date>(new Date());
  rentMonth = new FormControl<number>(new Date().getMonth() + 1);
  rentYear = new FormControl<number>(new Date().getFullYear());
  rentNote = new FormControl<string>('');

  monthConfig = { id: 'month', label: 'Month' };
  yearConfig = { id: 'year', label: 'Year' };

  get monthOptions() {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: this.maintenanceService.getMonthFullName(i + 1)
    }));
  }

  get yearOptions() {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => ({
      value: currentYear - i,
      label: (currentYear - i).toString()
    }));
  }

  get userCurrencySymbol(): string {
    return this.countryService.loggedInUserCountryCurrency?.currencySymbol ?? '₹';
  }

  get isMobile(): boolean {
    return this.windowService.mode.value === 'mobile';
  }


  get pageTitle(): string {
    if (this.flatMember && typeof this.flatMember.flatId !== 'string') {
      const flat = this.flatMember.flatId;
      return `Flat: ${flat.flatNumber} · Floor ${flat.floor}`;
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
    const residingType = this.residingType ?? ''
    return this.windowService.mode.value === 'mobile' ? residingType : 'Residing: ' + residingType
  }

  get owner(): IFlatMember | undefined {
    return this.flatMember?.owner;
  }

  get showOwnerSection(): boolean {
    if (!this.owner || !this.myProfile) return false;
    const ownerUserId = typeof this.owner.userId === 'string' ? this.owner.userId : this.owner.userId?._id;
    return ownerUserId !== this.myProfile.user._id;
  }

  get ownerName(): string {
    const ownerUserId = this.owner?.userId;
    if (ownerUserId && typeof ownerUserId === 'object' && (ownerUserId as any).name) {
      return (ownerUserId as any).name;
    }
    return this.owner?.name || 'N/A';
  }

  get canManageFlat(): boolean {
    if (!this.flatMember || !this.myProfile) return false;

    // Check if viewed member is the user
    const viewedUserId = typeof this.flatMember.userId === 'string' ? this.flatMember.userId : this.flatMember.userId?._id;
    if (viewedUserId === this.myProfile.user._id) return true;

    // Check if user is in members list
    return this.members.some(m => {
      const mUserId = typeof m.userId === 'string' ? m.userId : m.userId?._id;
      return mUserId === this.myProfile?.user._id;
    });
  }

  get currentSocietyId(): string | undefined {
    if (!this.flatMember) return undefined;

    const societyId = this.flatMember.societyId;
    if (typeof societyId === 'string') {
      return societyId;
    } else if (societyId && typeof societyId === 'object' && '_id' in societyId) {
      return societyId._id;
    }
    return undefined;
  }

  get currentFlatId(): string | undefined {
    if (!this.flatMember) return undefined;

    const flatId = this.flatMember.flatId;
    if (typeof flatId === 'string') {
      return flatId;
    } else if (flatId && typeof flatId === 'object' && '_id' in flatId) {
      return flatId._id;
    }
    return undefined;
  }

  get canUpdateSociety(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_update, this.currentSocietyId);
  }

  get flatId() {
    return typeof this.flatMember?.flatId === 'string'
      ? this.flatMember.flatId
      : this.flatMember?.flatId._id;
  }

  get residingType(): string {
    const flat = this.getflat();
    if (flat && flat.residingType) return flat.residingType;
    return this.flatMember?.residingType || 'Vacant';
  }

  getDisplayName(member?: IFlatMember): string {
    if (!member) return '—';
    const userId = member.userId;
    if (userId && typeof userId === 'object' && (userId as any).name) {
      return (userId as any).name;
    }
    return member.name || '—';
  }

  get isTenantResiding() {
    return this.residingType === ResidingTypes.Tenant;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public societyService: SocietyService,
    private complaintService: ComplaintService,
    private gateEntryService: GateEntryService,
    private gatepassService: GatePassService,
    private loginService: LoginService,
    private windowService: WindowService,
    private planService: PricingPlanService,
    private dialog: MatDialog,
    private vehicleService: VehicleService,
    private dialogService: DialogService,
    public maintenanceService: MaintenanceService,
    public rentService: RentService,
    public countryService: CountryService,
    private currencyService: CurrencyService,
    private tenantDocumentService: TenantDocumentService,
    private snackBar: MatSnackBar
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

  viewHistory(): void {
    if (this.flatMember) {
      const flatId = typeof this.flatMember.flatId === 'string' ? this.flatMember.flatId : this.flatMember.flatId._id;
      const societyId = typeof this.flatMember.societyId === 'string' ? this.flatMember.societyId : this.flatMember.societyId._id;

      this.router.navigate(['/myflats/logs', flatId], {
        queryParams: { societyId }
      });
    }
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
    this.loadingFlatMember = true;
    this.societyService.getFlatMemberDetails(flatMemberId)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.flatMember = response;

          // Get societyId from flat member
          const societyId = typeof this.flatMember.societyId === 'string'
            ? this.flatMember.societyId
            : this.flatMember.societyId._id;

          // Auto select society if not already selected
          const society = this.flatMember.societyId;
          if (typeof society !== 'string') {
            if (this.societyService.selectedSocietyFilterValue?.value !== society._id) {
              this.societyService.selectSocietyFilter({ label: society.societyName, value: society._id });
            }
          }
          this.loadingFlatMember = false;

          // Load current plan to check feature availability
          this.loadCurrentPlan(societyId);
        },
        error: (err) => {
          this.loadingFlatMember = false;
          console.error('Failed to load flat member', err);
        }
      });
  }

  loadCurrentPlan(societyId: string): void {
    this.loadingPlan = true;
    this.planService.getCurrentPlan(societyId)
      .pipe(take(1))
      .subscribe({
        next: (response: ICurrentPlanResponse | null) => {
          this.currentPlan = response || undefined;

          // Check feature availability from current plan
          if (this.currentPlan?.planDetails?.features) {
            this.checkFeatureAvailability(this.currentPlan);
          }
          this.loadingPlan = false;

          // Now load data based on feature availability
          this.loadRelatedData();
        },
        error: (err) => {
          this.loadingPlan = false;
          console.log('Error loading current plan');
          this.currentPlan = undefined;
          // Even without plan, load data (might be free tier with basic features)
          this.loadRelatedData();
        }
      });
  }

  /**
   * Check which features are available in the current plan
   */
  checkFeatureAvailability(currentPlan: ICurrentPlanResponse): void {
    const isExpired = currentPlan.isExpired;

    // Check features using keys from FEATURES enum
    this.membersFeatureAvailable = !isExpired && currentPlan.planDetails.features.some(f =>
      f.key === FEATURES.FLAT_MEMBER_MANAGEMENT && f.included === true
    );
    if (!this.membersFeatureAvailable) this.loadingOtherFlatMembers = false;

    this.vehiclesFeatureAvailable = !isExpired && currentPlan.planDetails.features.some(f =>
      f.key === FEATURES.VEHICLE && f.included === true
    );
    if (!this.vehiclesFeatureAvailable) this.loadingVehicles = false;

    this.parkingFeatureAvailable = !isExpired && currentPlan.planDetails.features.some(f =>
      f.key === FEATURES.PARKING && f.included === true
    );
    if (!this.parkingFeatureAvailable) this.loadingParkings = false;

    this.complaintsFeatureAvailable = !isExpired && currentPlan.planDetails.features.some(f =>
      f.key === FEATURES.COMPLAINTS && f.included === true
    );
    if (!this.complaintsFeatureAvailable) this.loadingComplaints = false;

    this.gateEntriesFeatureAvailable = !isExpired && currentPlan.planDetails.features.some(f =>
      f.key === FEATURES.GATE_ENTRIES && f.included === true
    );
    if (!this.gateEntriesFeatureAvailable) this.laodingGateEntries = false;

    this.gatePassesFeatureAvailable = !isExpired && currentPlan.planDetails.features.some(f =>
      f.key === FEATURES.SMART_GATE_PASS && f.included === true
    );
    if (!this.gatePassesFeatureAvailable) this.loadingGatePasses = false;

    this.tenantManagementFeatureAvailable = !isExpired && currentPlan.planDetails.features.some(f =>
      f.key === FEATURES.TENANT_MANAGEMENT && f.included === true
    );
    if (!this.tenantManagementFeatureAvailable) this.loadingTenants = false;

    this.rentFeatureAvailable = !isExpired && currentPlan.planDetails.features.some(f =>
      f.key === FEATURES.RENT && f.included === true
    );
    if (!this.rentFeatureAvailable) this.loadingRent = false;

    this.maintenanceFeatureAvailable = !isExpired && currentPlan.planDetails.features.some(f =>
      f.key === FEATURES.MAINTENANCE && f.included === true
    );
    if (!this.maintenanceFeatureAvailable) this.loadingMaintenance = false;

    // console.log('Feature availability:', {
    //   members: this.membersFeatureAvailable,
    //   vehicles: this.vehiclesFeatureAvailable,
    //   parking: this.parkingFeatureAvailable,
    //   complaints: this.complaintsFeatureAvailable,
    //   gateEntries: this.gateEntriesFeatureAvailable,
    //   gatePasses: this.gatePassesFeatureAvailable
    // });
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

    if (this.tenantManagementFeatureAvailable) {
      this.getTenants(societyId, flatId);
      this.loadTenantDocumentsData(flatId);
    } else {
      this.loadingDocuments = false;
    }

    if (this.rentFeatureAvailable) {
      if (this.isTenantResiding) {
        if (this.flatMember.isOwner) {
          this.loadRentReport(flatId);
        } else if (this.flatMember.isTenant) {
          this.getRentPayments(societyId, flatId);
        } else {
          this.loadingRent = false;
        }
      } else {
        this.loadingRent = false;
      }
    } else {
      this.loadingRent = false;
    }

    if (this.maintenanceFeatureAvailable) {
      this.getMaintenancePayments(societyId, flatId);
    }

    this.loadTenantDocumentsData(flatId);
  }

  getFlatMembers(societyId: string, flatId: string) {
    this.loadingOtherFlatMembers = true;
    this.societyService.myFlatMembers(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.members = response.data;
          this.loadingOtherFlatMembers = false;
        },
        error: err => {
          this.loadingOtherFlatMembers = false;
        }
      })
  }

  getComplaints(societyId: string, flatId: string) {
    this.loadingComplaints = true;
    this.complaintService.getComplaints(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.complaints = response.data || [];
          this.loadingComplaints = false;
        },
        error: err => {
          this.loadingComplaints = false;
        }
      });
  }

  getGateEntries(societyId: string, flatId: string) {
    this.laodingGateEntries = true;
    this.gateEntryService.getAllMyGateEntries(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.gateEntries = response.data;
          this.laodingGateEntries = false;
        },
        error: err => {
          this.laodingGateEntries = false;
        }
      });
  }

  getGatePasses(societyId: string, flatId: string) {
    this.loadingGatePasses = true;
    this.gatepassService.getGattePasses(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.gatePasses = response.data;
          this.loadingGatePasses = false;
        },
        error: err => {
          this.loadingGatePasses = false;
        }
      });
  }

  getVehicles(societyId: string, flatId: string) {
    this.loadingVehicles = true;
    this.vehicles = [];
    this.vehicleService.getVehicles(flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.vehicles = response.data || [];
          this.loadingVehicles = false;
        },
        error: err => {
          this.loadingVehicles = false;
        }
      });
  }

  getParkings(societyId: string, flatId: string) {
    this.loadingParkings = true;
    this.societyService.getParkingsByFlat(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.parkings = response.data;
          this.loadingParkings = false;
        },
        error: err => {
          this.loadingParkings = false;
        }
      })
  }

  getTenants(societyId: string, flatId: string) {
    this.loadingTenants = true;
    this.societyService.myTenants(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.tenants = response.data.filter(t => t.status === 'active');
          this.loadingTenants = false;
        },
        error: err => {
          this.loadingTenants = false;
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

    switch (this.residingType) {
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
    if (!this.canManageFlat) return;
    this.resetDialogData();
    this.currentDialogRef = this.dialog.open(this.confirmationTemplate);
  }

  cancelResidingTypeChange() {
    this.currentDialogRef?.close();
  }

  handleConfigureTenantClick() {
    if (!this.flatMemberId) return;
    this.router.navigate(['/myflats/details', this.flatMemberId, 'configure-tenant']);
  }

  handleTenantClick() {
    this.cancelResidingTypeChange();

    if (this.tenantManagementFeatureAvailable)
      this.router.navigateByUrl('/tenants/add');

    else {
      alert('You do not have access to tenant management system.');
    }
  }

  handleVaccantClick() {
    if (!this.flatMember) return;

    if (this.residingType === ResidingTypes.Self) {
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

    if (this.residingType === ResidingTypes.Tenant) {
      this.societyService.moveOutTenant(this.flatMember._id)
        .pipe(take(1))
        .subscribe({
          next: response => {
            if (!response.success) return;

            if (this.flatMember) this.loadFlatMember(this.flatMember._id);
          },
          complete: () => this.cancelResidingTypeChange()
        });
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
    if (!this.canManageFlat) return;
    const societyId = this.currentSocietyId;
    const flatId = this.currentFlatId;
    if (societyId && flatId) {
      this.router.navigate(['/myflats', societyId, flatId, 'members']);
    }
  }

  manageVehicles() {
    if (!this.canManageFlat) return;
    const societyId = this.currentSocietyId;
    const flatId = this.currentFlatId;
    if (societyId && flatId) {
      this.router.navigate(['/myflats', societyId, flatId, 'vehicles']);
    }
  }

  manageComplaints() {
    if (!this.canManageFlat) return;
    const societyId = this.currentSocietyId;
    const flatId = this.currentFlatId;
    if (societyId && flatId) {
      this.router.navigate(['/myflats', societyId, flatId, 'complaints']);
    }
  }

  manageGateEntries() {
    if (!this.canManageFlat) return;
    const societyId = this.currentSocietyId;
    const flatId = this.currentFlatId;
    if (societyId && flatId) {
      this.router.navigate(['/myflats', societyId, flatId, 'gateEntries']);
    }
  }

  manageGatePasses() {
    if (!this.canManageFlat) return;
    const societyId = this.currentSocietyId;
    const flatId = this.currentFlatId;
    if (societyId && flatId) {
      this.router.navigate(['/myflats', societyId, flatId, 'gatePasses']);
    }
  }

  manageTenants() {
    if (!this.canManageFlat) return;
    const societyId = this.currentSocietyId;
    const flatId = this.currentFlatId;
    if (societyId && flatId) {
      this.router.navigate(['/myflats', societyId, flatId, 'tenants']);
    }
  }

  gotoPlanUpgrade() {
    if (!this.canManageFlat || !this.flatMember) return;

    const societyId = typeof this.flatMember.societyId === 'string'
      ? this.flatMember.societyId
      : this.flatMember.societyId._id;

    this.router.navigate(['society/current-plan', societyId]);
  }

  handleSocietyClick() {
    const societyId = this.currentSocietyId;
    if (societyId) {
      this.router.navigate(['society/details', societyId]);
    }
  }

  // ---- Maintenance ----

  getMaintenancePayments(societyId: string, flatId: string) {
    this.loadingMaintenance = true;
    const now = new Date();
    this.maintenanceService.getPaymentsByFlat(flatId, societyId, now.getMonth() + 1, now.getFullYear())
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.maintenancePayments = response.data || [];
          this.loadingMaintenance = false;
        },
        error: () => {
          this.loadingMaintenance = false;
        }
      });
  }

  get currentMonthPayment(): IMaintenancePayment | undefined {
    const now = new Date();
    const monthPayments = this.maintenancePayments.filter(p =>
      p.month === (now.getMonth() + 1) &&
      p.year === now.getFullYear()
    );

    if (monthPayments.length === 0) return undefined;

    return monthPayments.find(p => p.status === 'approved') ||
      monthPayments.find(p => p.status === 'pending_approval') ||
      monthPayments.find(p => p.status === 'rejected');
  }

  // ---- Rent ----

  loadRentReport(flatId: string) {
    this.loadingRent = true;
    const now = new Date();
    this.rentService.getMonthlyReport(flatId, now.getMonth() + 1, now.getFullYear())
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.rentMonthlyReport = response.data;
          this.loadingRent = false;
        },
        error: () => {
          this.loadingRent = false;
        }
      });
  }

  getRentPayments(societyId: string, flatId: string) {
    this.loadingRent = true;
    const now = new Date();
    this.rentService.getPaymentsByFlat(flatId, societyId, now.getMonth() + 1, now.getFullYear())
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.rentPayments = response.data || [];
          this.loadingRent = false;
        },
        error: () => {
          this.loadingRent = false;
        }
      });
  }

  get currentRentMonthPayment(): IRentPayment | undefined {
    const now = new Date();
    const monthPayments = this.rentPayments.filter(p => {
      const memberId = typeof p.flatMemberId === 'string' ? p.flatMemberId : (p.flatMemberId as any)?._id;
      return p.month === (now.getMonth() + 1) &&
        p.year === now.getFullYear() &&
        memberId === this.flatMember?._id;
    });

    if (monthPayments.length === 0) return undefined;

    return monthPayments.find(p => p.status === 'approved') ||
      monthPayments.find(p => p.status === 'pending_approval') ||
      monthPayments.find(p => p.status === 'rejected');
  }

  manageRent() {
    if (!this.canManageFlat) return;
    const flatId = this.currentFlatId;
    if (flatId) {
      this.router.navigate(['/myflats/rent-list', flatId], { queryParams: { societyId: this.currentSocietyId } });
    }
  }

  viewRentHistory() {
    if (this.flatMember) {
      const flatId = typeof this.flatMember.flatId === 'string' ? this.flatMember.flatId : this.flatMember.flatId._id;
      const societyId = typeof this.flatMember.societyId === 'string' ? this.flatMember.societyId : this.flatMember.societyId._id;

      this.router.navigate(['/myflats/rent-logs', flatId], {
        queryParams: { societyId }
      });
    }
  }

  openPayRentDialog() {
    const amountInINR = this.flatMember?.rentAmount || 0;
    this.rentAmount.setValue(this.currencyService.convertFromINR(amountInINR));
    this.rentMonth.setValue(new Date().getMonth() + 1);
    this.rentYear.setValue(new Date().getFullYear());
    this.rentDate.setValue(new Date());
    this.rentNote.setValue('');

    const width = this.windowService.mode.value === 'mobile' ? '90%' :
      this.windowService.mode.value === 'tablet' ? '70%' : '50%';

    this.rentDialogRef = this.dialog.open(this.rentPayTemplate, {
      width,
      panelClass: 'maintenance-dialog'
    });
  }

  closeRentDialog() {
    this.rentDialogRef?.close();
    this.rentDialogRef = null;
  }

  submitRentPayment() {
    if (!this.flatMember || !this.rentAmount.value) return;

    const societyId = this.currentSocietyId;
    const flatId = this.currentFlatId;
    if (!societyId || !flatId) return;

    this.recordingRent = true;
    const now = new Date();

    const payload = {
      societyId,
      flatId,
      flatMemberId: this.flatMember._id,
      amount: this.currencyService.convertToINR(this.rentAmount.value),
      month: this.rentMonth.value,
      year: this.rentYear.value,
      paidOn: this.rentDate.value || now,
      note: this.rentNote.value || undefined
    };

    this.rentService.recordPayment(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.recordingRent = false;
          if (response.success) {
            this.closeRentDialog();
            this.getRentPayments(societyId, flatId);
          }
        },
        error: () => {
          this.recordingRent = false;
        }
      });
  }

  get currentMonthLabel(): string {
    const now = new Date();
    return this.maintenanceService.getMonthFullName(now.getMonth() + 1) + ' ' + now.getFullYear();
  }

  openPayMaintenanceDialog() {
    this.maintenanceAmount.setValue(0);
    this.maintenanceMonth.setValue(new Date().getMonth() + 1);
    this.maintenanceYear.setValue(new Date().getFullYear());
    this.maintenanceDate.setValue(new Date());
    this.maintenancePaymentMethod.setValue('');
    this.maintenancePaymentDetails.setValue('');
    this.maintenanceNote.setValue('');

    const width = this.windowService.mode.value === 'mobile' ? '90%' :
      this.windowService.mode.value === 'tablet' ? '70%' : '50%';

    this.maintenanceDialogRef = this.dialog.open(this.maintenancePayTemplate, {
      width,
      panelClass: 'maintenance-dialog'
    });
  }

  closeMaintenanceDialog() {
    this.maintenanceDialogRef?.close();
    this.maintenanceDialogRef = null;
  }

  submitMaintenancePayment() {
    if (!this.flatMember || !this.maintenanceAmount.value) return;

    const societyId = this.currentSocietyId;
    const flatId = this.currentFlatId;
    if (!societyId || !flatId) return;

    this.recordingMaintenance = true;
    const now = new Date();

    const payload = {
      societyId,
      flatId,
      flatMemberId: this.flatMember._id,
      amount: this.currencyService.convertToINR(this.maintenanceAmount.value),
      month: this.maintenanceMonth.value,
      year: this.maintenanceYear.value,
      paymentMethod: this.maintenancePaymentMethod.value || undefined,
      paymentDetails: this.maintenancePaymentDetails.value
        ? { details: this.maintenancePaymentDetails.value }
        : undefined,
      paidOn: this.maintenanceDate.value || now,
      note: this.maintenanceNote.value || undefined
    };

    this.maintenanceService.recordPayment(payload)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.recordingMaintenance = false;
          if (response.success) {
            this.closeMaintenanceDialog();
            this.getMaintenancePayments(societyId, flatId);
          }
        },
        error: () => {
          this.recordingMaintenance = false;
        }
      });
  }

  getPaymentStatusText(status: string): string {
    return this.maintenanceService.getStatusDisplayText(status);
  }

  getPaymentStatusClass(status: string): string {
    return this.maintenanceService.getStatusColorName(status);
  }

  // ---- Tenant Documents ----

  loadTenantDocumentsData(flatId: string) {
    if (!this.flatMember || !this.myProfile) return;

    if (this.flatMember.isOwner) {
      this.getTenantDocumentStats(flatId);
      this.getTenantDocuments(flatId, true); // Fetch all documents for the flat
    } else if (this.flatMember.isTenant) {
      this.getTenantDocuments(flatId);
    }
  }

  getTenantDocumentStats(flatId: string) {
    this.loadingDocuments = true;
    this.tenantDocumentService.getDocumentStats(flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.tenantDocumentStats = response.data || [];
          this.loadingDocuments = false;
        },
        error: () => {
          this.loadingDocuments = false;
        }
      });
  }

  getTenantDocuments(flatId: string, all = false) {
    this.loadingDocuments = true;
    const filter: any = { flatId };
    if (!all) {
      filter.tenantId = this.myProfile?.user._id;
    }
    this.tenantDocumentService.getDocuments(filter)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.tenantDocuments = response.data || [];
          this.loadingDocuments = false;
        },
        error: () => {
          this.loadingDocuments = false;
        }
      });
  }

  manageTenantDocuments() {
    if (!this.flatMember) return;
    const flatId = this.currentFlatId;
    const societyId = this.currentSocietyId;
    const flatMemberId = this.flatMemberId;
    if (flatId && flatMemberId) {
      if (this.flatMember.isOwner) {
        this.router.navigate(['/myflats/tenant-documents', flatId], { queryParams: { societyId } });
      } else {
        this.router.navigate(['/myflats/tenant-document-manager', flatId], { queryParams: { societyId, flatMemberId } });
      }
    }
  }

  downloadDocument(doc: ITenantDocument) {
    const link = document.createElement('a');
    link.href = doc.documentUrl;
    link.download = doc.documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  viewDocument(doc: ITenantDocument) {
    this.dialogService.viewDocument(doc.documentUrl, doc.documentName, doc.documentType);
  }

  deleteDocument(doc: ITenantDocument) {
    this.dialogService.confirmDelete('Delete Document', 'Are you sure you want to delete this document?').then(confirmed => {
      if (confirmed) {
        this.tenantDocumentService.deleteDocument(doc._id)
          .pipe(take(1))
          .subscribe({
            next: response => {
              if (response.success) {
                this.snackBar.open('Document deleted successfully', 'Close', { duration: 3000 });
                const flatId = typeof doc.flatId === 'string' ? doc.flatId : doc.flatId._id;
                this.getTenantDocuments(flatId);
              }
            }
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.currentDialogRef?.close();
    this.maintenanceDialogRef?.close();
  }
}