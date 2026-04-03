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

  loadingSociety = false;
  loadingFlatMembers = false;

  constructor(private societyService: SocietyService, private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.societyId = this.route.snapshot.paramMap.get('id')!;

    if (this.societyService.selectedSocietyFilterValue?.value && !this.societyId) {
      this.router.navigateByUrl(`myflats/${this.societyService.selectedSocietyFilterValue?.value}/list`);

    }

    if (this.societyId) {
      this.loadSociety(this.societyId);
    }
    this.loadMyFlats(this.societyId);
  }

  loadSociety(societyId: string) {
    this.loadingSociety = true;
    this.societyService.getSociety(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.society = response;
          if (!this.societyService.selectedSocietyFilterValue?.value && this.society) {
            this.societyService.selectSocietyFilter({ label: this.society.societyName, value: this.society._id });
          }
          this.loadingSociety = false;
        },
        error: err => {
          this.loadingSociety = false;
        }
      })
  }

  loadMyFlats(societyId?: string) {
    this.loadingFlatMembers = true;
    this.societyService.myFlats(societyId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.flatMembers = response.data ?? [];
          if (societyId) {
            this.flatMembers = this.flatMembers.filter(f => {
              if ((typeof f.societyId !== 'string' && f.societyId._id === societyId) || f.societyId === societyId)
                return true;
              else
                return false;
            })
          }
          this.loadingFlatMembers = false;
        },
        error: err => {
          this.loadingFlatMembers = false;
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
