import { Component, OnInit } from '@angular/core';
import { IBuilding, IComplaintStats, IFlat, IParking, ISociety, IUser } from '../../../interfaces';
import { FlatTypes, PERMISSIONS } from '../../../constants';
import { ActivatedRoute, Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { take } from 'rxjs';
import { LoginService } from '../../../services/login.service';

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

  constructor(private router: Router, private route: ActivatedRoute, private societyService: SocietyService,
    private loginService: LoginService) { }


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
          // if (this.society.flatIds) this.loadFlats(this.society.flatIds);
          this.loadComplaints(this.society._id);
          this.loadParkings(this.society._id);
          // this.loadFeatures(this.society._id);
          // this.loadSecretaries(this.society._id);
        },
        error: err => console.log('Error while getting society details')
      });
  }


  /** Step 2: Load buildings separately */
  // loadBuildings(ids: string[]): void {
  //   // 🔁 Replace with API call later
  //   this.buildings = [
  //     { _id: '101', buildingNumber: 'A Wing', societyId: '20' } as IBuilding,
  //     { _id: '102', buildingNumber: 'B Wing', societyId: '16' } as IBuilding
  //   ];
  // }


  /** Step 3: Load flats separately */
  loadFlats(ids: string[]): void {
    // 🔁 Replace with API call later
    this.flats = [
      { _id: '201', flatNumber: 'A-101', societyId: '100', buildingId: '101', flatType: FlatTypes['1BHK'] } as IFlat,
      { _id: '202', flatNumber: 'A-102', societyId: '100', buildingId: '101', flatType: FlatTypes['1BHK'] } as IFlat,
      { _id: '203', flatNumber: 'B-201', societyId: '100', buildingId: '102', flatType: FlatTypes['1BHK'] } as IFlat,
      { _id: '204', flatNumber: 'B-202', societyId: '100', buildingId: '102', flatType: FlatTypes['1BHK'] } as IFlat
    ];
  }


  /** Step 4: Complaints by society */
  loadComplaints(societyId: string): void {
    // 🔁 Replace with API call later
    this.complaints = {
      pending: 5,
      completed: 18
    } as IComplaintStats;
  }


  /** Step 5: Parkings by society */
  loadParkings(societyId: string): void {
    // 🔁 Replace with API call later
    this.parkings = [
      { _id: '1', parkingNumber: 'CAR' } as IParking,
      { _id: '2', parkingNumber: 'BIKE', flatId: '101' } as IParking
    ];
  }


  /** Step 6: Features by society */
  // loadFeatures(societyId: string): void {
  //   // 🔁 Replace with API call later
  //   this.features = [
  //     { _id: '1', societyId: '101', featureKey: 'asdasd' } as ISocietyFeature,
  //     { _id: '2', societyId: '101', featureKey: '101' } as ISocietyFeature
  //   ];
  // }


  /** Step 7: Secretary by society */
  // loadSecretaries(societyId: string): void {
  //   // 🔁 Replace with API call later
  //   this.secretaries = [
  //     { _id: '1', memberName: 'name1', memberContactNumber: '567567' } as IFlatMember,
  //     { _id: '2', memberName: 'name2', memberContactNumber: '567567' } as IFlatMember,
  //     { _id: '2', memberName: 'name2', memberContactNumber: '567567' } as IFlatMember,
  //     { _id: '2', memberName: 'name2', memberContactNumber: '567567' } as IFlatMember,
  //     { _id: '2', memberName: 'name2', memberContactNumber: '567567' } as IFlatMember,
  //     { _id: '2', memberName: 'name2', memberContactNumber: '567567' } as IFlatMember,
  //     { _id: '2', memberName: 'name2', memberContactNumber: '567567' } as IFlatMember
  //   ];
  // }

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

  async removeSecretary(user: IUser) {
    if (!this.society) return;

    this.societyService.deleteManager(this.society._id, user._id)
      .pipe(take(1))
      .subscribe(() => {
        this.loadSociety(this.society?._id ?? '');
      });
  }
}
