import { Component, OnInit } from '@angular/core';
import { IComplaintStats, ICurrentPlanResponse, IFlat, IParking, IPricingFeature, ISociety, IUser } from '../../../interfaces';
import { FEATURES, PERMISSIONS } from '../../../constants';
import { ActivatedRoute, Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { take, forkJoin, of } from 'rxjs';
import { LoginService } from '../../../services/login.service';
import { ComplaintService } from '../../../services/complaint.service';
import { PricingPlanService } from '../../../services/pricing-plan.service';
import { catchError } from 'rxjs/operators';
import { MaintenanceService } from '../../../services/maintenance.service';
import { IMaintenanceSummary } from '../../../interfaces';

@Component({
  selector: 'app-society-details',
  templateUrl: './society-details.component.html',
  styleUrl: './society-details.component.scss'
})
export class SocietyDetailsComponent implements OnInit {

  society?: ISociety;
  currentPlan?: ICurrentPlanResponse;
  parkings: IParking[] = [];
  complaints?: IComplaintStats;
  // features: ISocietyFeature[] = [];
  securities: IUser[] = [];
  managerIds: IUser[] = [];
  adminIds: IUser[] = [];

  // Feature availability flags
  parkingFeatureAvailable: boolean = false;
  complaintsFeatureAvailable: boolean = false;
  maintenanceFeatureAvailable: boolean = false;


  loadingSociety = true;
  loadingPlan = true;
  loadingComplaints = true;
  loadingBuildings = true;
  loadingFlats = true;
  loadingParkings = true;
  loadingSecurities = true;
  loadingMaintenance = true;
  maintenanceSummary?: IMaintenanceSummary;

  addedBuildings = 0;
  addedFlats = 0;

  get canUpdateSociety(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_update, this.society?._id);
  }

  get canViewManager(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.manager_view, this.society?._id);
  }

  get canDeleteManager(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.manager_delete, this.society?._id);
  }

  get canViewAdmin(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_adminContact_view, this.society?._id);
  }

  get canDeleteAdmin(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_adminContact_delete, this.society?._id);
  }

  get canViewBuildings(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.building_view, this.society?._id);
  }

  get canViewFlats(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.flat_view, this.society?._id);
  }

  get canViewParkings(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.parking_view, this.society?._id);
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private societyService: SocietyService,
    private loginService: LoginService,
    private complaintService: ComplaintService,
    private planService: PricingPlanService,
    private maintenanceService: MaintenanceService
  ) { }


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('societyId');
    if (id) {
      this.loadSociety(id);
    } else {
      this.router.navigateByUrl('');
    }
  }

  getPlanDurationDisplay(): string {
    if (!this.currentPlan?.selectedDuration) return 'No Plan';

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

  /**
  * Step 1: Load society basic info
  * (contains buildingIds & flatIds only)
  */
  loadSociety(societyId: string): void {
    this.loadingSociety = true;
    this.societyService.getSociety(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.society = response;
          const managerIds = this.society.managerIds;

          this.managerIds = managerIds.reduce((arr: IUser[], s) => {
            if (typeof s !== 'string') arr.push(s);
            return arr;
          }, [] as IUser[]);


          const adminIds = this.society.adminContacts;

          this.adminIds = adminIds.reduce((arr: IUser[], s) => {
            if (typeof s !== 'string') arr.push(s);
            return arr;
          }, [] as IUser[]);


          this.loadingSociety = false;

          // Securities list do not need an active Plan so load it
          this.loadSecurities(societyId);

          // First load current plan to check feature availability
          this.loadCurrentPlan(societyId);
        },
        error: err => {
          this.loadingSociety = false;
          console.log('Error while getting society details');
        }
      });
  }

  loadCurrentPlan(societyId: string): void {
    this.loadingPlan = true;
    this.planService.getCurrentPlan(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.currentPlan = response;

          // Check feature availability from current plan
          if (this.currentPlan?.features) {
            this.checkFeatureAvailability(this.currentPlan);
          }

          this.loadingPlan = false;

          // Now load data based on feature availability
          this.loadFeatureSpecificData(societyId);
        },
        error: (err) => {
          console.log('No active plan found');
          this.currentPlan = undefined;
          this.loadingPlan = false;
          // Even without plan, load data (might be free tier with basic features)
          this.loadFeatureSpecificData(societyId);
        }
      });
  }

  /**
   * Check which features are available in the current plan
   */
  checkFeatureAvailability(plan: ICurrentPlanResponse): void {
    const isExpired = plan.isExpired;

    // Check for parking feature using FEATURES enum
    this.parkingFeatureAvailable = !isExpired && plan.features.some(f =>
      f.key === FEATURES.PARKING && f.included === true
    );

    // Check for complaints feature using FEATURES enum
    this.complaintsFeatureAvailable = !isExpired && plan.features.some(f =>
      f.key === FEATURES.COMPLAINTS && f.included === true
    );

    this.maintenanceFeatureAvailable = !isExpired && plan.features.some(f =>
      f.key === FEATURES.MAINTENANCE && f.included === true
    );

    // console.log('Feature availability:', {
    //   parking: this.parkingFeatureAvailable,
    //   complaints: this.complaintsFeatureAvailable
    // });
  }

  /**
   * Load data only for features that are available in the current plan
   */
  loadFeatureSpecificData(societyId: string): void {
    // Load flat and building counts not dependent on plan
    this.loadBuilldingsCount(societyId);
    this.loadFlatCounts(societyId);

    // Load complaints only if feature is available
    if (this.complaintsFeatureAvailable) {
      this.loadComplaints(societyId);
    } else {
      this.loadingComplaints = false;
    }

    // Load parkings only if feature is available
    if (this.parkingFeatureAvailable) {
      this.loadParkings(societyId);
    } else {
      this.loadingParkings = false;
    }

    // Load maintenance summary if feature is available
    if (this.maintenanceFeatureAvailable) {
      this.loadMaintenanceSummary(societyId);
    } else {
      this.loadingMaintenance = false;
    }
  }

  /** Load complaints by society */
  loadComplaints(societyId: string): void {
    this.loadingComplaints = true;
    this.complaintService.getComplaints(societyId, undefined, undefined, undefined, { limit: 50000 })
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.complaints = {
            pending: response.data.filter(d => ['submitted', 'approved', 'in_progress'].includes(d.status)).length,
            completed: response.data.filter(d => ['resolved', 'closed', 'rejected'].includes(d.status)).length
          }
          this.loadingComplaints = false;
        },
        error: err => {
          this.loadingComplaints = false;
        }
      });
  }

  /* Load buildings by society */
  loadBuilldingsCount(societyId: string) {
    this.loadingBuildings = true;
    this.societyService.getBuildingsCount(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response.success)
            this.addedBuildings = response.data ?? 0;
          this.loadingBuildings = false;
        },
        error: err => {
          this.loadingBuildings = false;
        }
      })
  }

  /* Load flats by society */
  loadFlatCounts(societyId: string) {
    this.loadingFlats = true;
    this.societyService.getFlatsCount(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response.success)
            this.addedFlats = response.data ?? 0;
          this.loadingFlats = false;
        },
        error: err => {
          this.loadingFlats = false;
        }
      })
  }

  /* Load Society Security */
  loadSecurities(societyId: string) {
    this.loadingSecurities = true;
    this.societyService.getSocietySecurities(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.loadingSecurities = false;
          if (!response.success || !response.data) return;

          this.securities = response.data.reduce((arr, s) => {
            if (typeof s.userId !== 'string') {
              arr.push(s.userId);
            }
            return arr;
          }, [] as IUser[]);
        },
        error: err => {
          this.loadingSecurities = false;
        }
      })
  }


  /** Load parkings by society */
  loadParkings(societyId: string): void {
    this.loadingParkings = true;
    this.societyService.getParkings(societyId, undefined, { limit: 50000 })
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
      });
  }

  gotoPlanEdit(): void {
    this.router.navigate(['society/current-plan', this.society?._id]);
  }

  gotoEditSociety() {
    this.router.navigate(['/society', this.society?._id, 'edit']);
  }

  gotoSocietyManageers() {
    this.router.navigate(['/society', this.society?._id, 'managers']);
  }

  gotoSocietySecurities() {
    this.router.navigate(['/society', this.society?._id, 'securities']);
  }

  gotoSocietyAdmins() {
    this.router.navigate(['/society', this.society?._id, 'admins']);
  }

  gotoBuildingManager() {
    this.router.navigate(['/society', this.society?._id, 'buildings']);
  }

  gotoFlatManager() {
    this.router.navigate(['/society', this.society?._id, 'flats']);
  }

  gotoParkingManager() {
    if (this.parkingFeatureAvailable) {
      this.router.navigate(['/society', this.society?._id, 'parkings']);
    }
  }

  loadMaintenanceSummary(societyId: string): void {
    this.loadingMaintenance = true;
    const now = new Date();
    this.maintenanceService.getMaintenanceSummary(societyId, now.getMonth() + 1, now.getFullYear())
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response.success) {
            this.maintenanceSummary = response.data;
          }
          this.loadingMaintenance = false;
        },
        error: () => {
          this.loadingMaintenance = false;
        }
      });
  }

  gotoMaintenance() {
    if (this.maintenanceFeatureAvailable) {
      this.router.navigate(['/society', this.society?._id, 'maintenance']);
    }
  }

  gotoComplaints() {
    if (this.complaintsFeatureAvailable) {
      this.router.navigate(['/complaints'], { queryParams: { societyId: this.society?._id } });
    }
  }

  gotoChat() {
    this.societyService.selectSocietyFilter({ label: this.society?.societyName || '', value: this.society?._id || '' } as any);
    this.router.navigate(['/chat/list'], { queryParams: { societyId: this.society?._id } });
  }

  async removeSecretary(user: IUser) {
    if (!this.society) return;

    this.societyService.deleteManager(this.society._id, user._id)
      .pipe(take(1))
      .subscribe(() => {
        this.loadSociety(this.society?._id ?? '');
      });
  }

  async removeAdmin(user: IUser) {
    if (!this.society) return;

    this.societyService.deleteSocietyAdmin(this.society._id, user._id)
      .pipe(take(1))
      .subscribe(() => {
        this.loadSociety(this.society?._id ?? '');
      });
  }
}