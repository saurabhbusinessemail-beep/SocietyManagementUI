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
  managerIds: IUser[] = [];
  adminIds: IUser[] = [];

  // Feature availability flags
  parkingFeatureAvailable: boolean = false;
  complaintsFeatureAvailable: boolean = false;
  featuresLoaded: boolean = false;

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
    private planService: PricingPlanService
  ) { }


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
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


          // First load current plan to check feature availability
          this.loadCurrentPlan(societyId);
        },
        error: err => console.log('Error while getting society details')
      });
  }

  loadCurrentPlan(societyId: string): void {
    this.planService.getCurrentPlan(societyId).subscribe({
      next: response => {
        this.currentPlan = response;

        // Check feature availability from current plan
        if (this.currentPlan?.features) {
          this.checkFeatureAvailability(this.currentPlan.features);
        }

        // Now load data based on feature availability
        this.loadFeatureSpecificData(societyId);
        this.featuresLoaded = true;
      },
      error: (err) => {
        console.log('No active plan found');
        this.currentPlan = undefined;
        this.featuresLoaded = true;
        // Even without plan, load data (might be free tier with basic features)
        this.loadFeatureSpecificData(societyId);
      }
    });
  }

  /**
   * Check which features are available in the current plan
   */
  checkFeatureAvailability(features: IPricingFeature[]): void {
    // Check for parking feature using FEATURES enum
    this.parkingFeatureAvailable = features.some(f =>
      f.key === FEATURES.PARKING && f.included === true
    );

    // Check for complaints feature using FEATURES enum
    this.complaintsFeatureAvailable = features.some(f =>
      f.key === FEATURES.COMPLAINTS && f.included === true
    );

    console.log('Feature availability:', {
      parking: this.parkingFeatureAvailable,
      complaints: this.complaintsFeatureAvailable
    });
  }

  /**
   * Load data only for features that are available in the current plan
   */
  loadFeatureSpecificData(societyId: string): void {
    // Load complaints only if feature is available
    if (this.complaintsFeatureAvailable) {
      this.loadComplaints(societyId);
    }

    // Load parkings only if feature is available
    if (this.parkingFeatureAvailable) {
      this.loadParkings(societyId);
    }
  }

  /** Load complaints by society */
  loadComplaints(societyId: string): void {
    this.complaintService.getComplaints(societyId, undefined, undefined, undefined, { limit: 50000 })
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.complaints = {
            pending: response.data.filter(d => ['submitted', 'approved', 'in_progress'].includes(d.status)).length,
            completed: response.data.filter(d => ['resolved', 'closed', 'rejected'].includes(d.status)).length
          }
        }
      });
  }


  /** Load parkings by society */
  loadParkings(societyId: string): void {
    this.societyService.getParkings(societyId, undefined, { limit: 50000 })
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.parkings = response.data;
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

  gotoComplaints() {
    if (this.complaintsFeatureAvailable) {
      this.router.navigate(['/complaints'], { queryParams: { societyId: this.society?._id } });
    }
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