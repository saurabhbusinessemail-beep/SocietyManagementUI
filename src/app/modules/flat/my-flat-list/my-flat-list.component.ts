import { Component, OnInit } from '@angular/core';
import { SocietyService } from '../../../services/society.service';
import { take } from 'rxjs';
import { IBuilding, IFlat, IFlatMember, ISociety } from '../../../interfaces';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-my-flat-list',
  templateUrl: './my-flat-list.component.html',
  styleUrl: './my-flat-list.component.scss'
})
export class MyFlatListComponent implements OnInit {

  societyId?: string;
  society?: ISociety;
  flatMembers: IFlatMember[] = [];

  get pageTitle(): string {
    return (this.society ? this.society.societyName : 'My') + ' Flats';
  }

  constructor(private societyService: SocietyService, private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.societyId = this.route.snapshot.paramMap.get('id')!;
    if (this.societyId) {
      this.loadSociety(this.societyId);
    }
    this.loadMyFlats(this.societyId);
  }

  loadSociety(societyId: string) {
    this.societyService.getSociety(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.society = response;
        }
      })
  }

  loadMyFlats(societyId?: string) {
    this.societyService.myFlats(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.flatMembers = response;
        }
      });
  }

  getflat(flatMember: IFlatMember): IFlat | undefined {
    return typeof flatMember.flatId === 'string' ? undefined : flatMember.flatId;
  }

  hasBuilding(flatMember: IFlatMember): boolean {
    const flat = this.getflat(flatMember);
    return !flat || !flat.buildingId || typeof flat.buildingId === 'string' ? false : true;
  }

  getBuilding(flatMember: IFlatMember): IBuilding | undefined {
    const flat = this.getflat(flatMember);
    return !flat || !flat.buildingId || typeof flat.buildingId === 'string' ? undefined : flat.buildingId;
  }

  getSociety(flatMember: IFlatMember): ISociety | undefined {
    return typeof flatMember.societyId === 'string' ? undefined : flatMember.societyId;
  }

  gotoFlatDetails(flatMember: IFlatMember) {
    this.router.navigate(['/myflats', 'details', flatMember._id]);
  }
}
