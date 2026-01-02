import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { take } from 'rxjs';
import { IFlat, IFlatMember, ISociety } from '../../../interfaces';

@Component({
  selector: 'app-flat-details',
  templateUrl: './flat-details.component.html',
  styleUrl: './flat-details.component.scss'
})
export class FlatDetailsComponent implements OnInit {

  flatMemberId?: string;
  flatMember?: IFlatMember;


  get pageTitle(): string {
    return this.flatMember && typeof this.flatMember.flatId !== 'string'
      ? (this.flatMember.flatId.floor + ':' + this.flatMember.flatId.flatNumber)
      : ''
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private societyService: SocietyService
  ) { }

  ngOnInit(): void {
    this.flatMemberId = this.route.snapshot.paramMap.get('flatMemberId')!;
    if (!this.flatMemberId) {
      this.router.navigateByUrl('/myflats')
    }

    this.loadFlatMember(this.flatMemberId)
  }

  loadFlatMember(flatMemberId: string) {
    this.societyService.getFlatMemberDetails(flatMemberId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.flatMember = response;
        },
      })
  }

  getflat(): IFlat | undefined {
    return typeof this.flatMember?.flatId === 'string' ? undefined : this.flatMember?.flatId;
  }

  getSociety(): ISociety | undefined {
    return typeof this.flatMember?.societyId === 'string' ? undefined : this.flatMember?.societyId;
  }

}
