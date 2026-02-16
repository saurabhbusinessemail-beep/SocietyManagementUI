import { Component, OnInit } from '@angular/core';
import { IComplaintStats, IFlat, IParking, ISociety, IUser } from '../../../interfaces';
import { PERMISSIONS } from '../../../constants';
import { ActivatedRoute, Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { take } from 'rxjs';
import { LoginService } from '../../../services/login.service';
import { ComplaintService } from '../../../services/complaint.service';

@Component({
  selector: 'app-society-details',
  templateUrl: './society-details.component.html',
  styleUrl: './society-details.component.scss'
})
export class SocietyDetailsComponent implements OnInit {

  society?: ISociety;
  flats: IFlat[] = [];
  parkings: IParking[] = [];
  complaints?: IComplaintStats;
  // features: ISocietyFeature[] = [];
  managerIds: IUser[] = [];

  get canUpdateSociety(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_update, this.society?._id);
  }

  get canViewManager(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_adminContact_view, this.society?._id);
  }

  get canDeleteManager(): boolean {
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
    private complaintService: ComplaintService
  ) { }


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSociety(id);
    } else {
      this.router.navigateByUrl('');
    }
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


          // if (this.society.buildingIds) this.loadBuildings(this.society.buildingIds);
          this.loadFlats(this.society._id);
          this.loadComplaints(this.society._id);
          this.loadParkings(this.society._id);
          // this.loadFeatures(this.society._id);
          // this.loadSecretaries(this.society._id);
        },
        error: err => console.log('Error while getting society details')
      });
  }


  /** Step 3: Load flats separately */
  loadFlats(societyId: string): void {
    this.societyService.getFlats(societyId, undefined, { limit: 10000 })
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.flats = response.data;
        }
      });
  }


  /** Step 4: Complaints by society */
  loadComplaints(societyId: string): void {
    // 🔁 Replace with API call later
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


  /** Step 5: Parkings by society */
  loadParkings(societyId: string): void {
    this.societyService.getParkings(societyId, undefined, { limit: 50000 })
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.parkings = response.data;
        }
      })
  }

  gotoEditSociety() {
    this.router.navigate(['/society', this.society?._id, 'edit']);
  }

  gotoSocietyManageers() {
    this.router.navigate(['/society', this.society?._id, 'managers']);
  }

  gotoBuildingManager() {
    this.router.navigate(['/society', this.society?._id, 'buildings']);
  }

  gotoFlatManager() {
    this.router.navigate(['/society', this.society?._id, 'flats']);
  }

  gotoParkingManager() {
    this.router.navigate(['/society', this.society?._id, 'parkings']);
  }

  gotoComplaints() {
    this.router.navigate(['/complaints']);
  }

  async removeSecretary(user: IUser) {
    if (!this.society) return;

    this.societyService.deleteManager(this.society._id, user._id)
      .pipe(take(1))
      .subscribe(() => {
        this.loadSociety(this.society?._id ?? '');
      });
  }
}
