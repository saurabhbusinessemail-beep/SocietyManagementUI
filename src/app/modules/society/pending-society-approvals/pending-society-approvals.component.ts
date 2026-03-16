import { Component, OnDestroy, OnInit } from '@angular/core';
import { IMyProfile, IPagedResponse, ISociety } from '../../../interfaces';
import { SocietyService } from '../../../services/society.service';
import { FormControl } from '@angular/forms';
import { debounceTime, Subject, switchMap, take, takeUntil } from 'rxjs';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-pending-society-approvals',
  templateUrl: './pending-society-approvals.component.html',
  styleUrl: './pending-society-approvals.component.scss'
})
export class PendingSocietyApprovalsComponent implements OnInit, OnDestroy {
  
  societies: ISociety[] = [];
  myProfile?: IMyProfile;

  page = 1;
  limit = 10;
  total = 0;

  searchControl = new FormControl<string>('');
  isComponentActive = new Subject<void>();

  expandedRow: number | null = null;

  get isAdmin(): boolean {
    return this.myProfile?.user.role === 'admin'
  }

  get totalPages() {
    return Math.ceil(this.societies.length / this.limit);
  }

  get paginatedSocieties() {
    const start = (this.page - 1) * this.limit;
    return this.societies.slice(start, start + this.limit);
  }

  constructor(private societyService: SocietyService, private loginService: LoginService) { }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();

    this.searchControl.valueChanges
      .pipe(
        takeUntil(this.isComponentActive),
        debounceTime(500),
        switchMap(() => this.getUnApprovedSocietyApiCall())
      )
      .subscribe(res => this.handleUnApprovedSocietyResponse(res));
    this.loadUnApprovedSocieties()
  }

  getUnApprovedSocietyApiCall() {
    return this.isAdmin ? this.societyService.getAllUnApprovedSocieties(this.page, this.limit, this.searchControl.value ?? '')
    : this.societyService.getMySocietiesForApproval(this.page, this.limit, this.searchControl.value ?? '')
  }

  loadUnApprovedSocieties() {

    this.getUnApprovedSocietyApiCall()
      .subscribe({
        next: res => this.handleUnApprovedSocietyResponse(res)
      });

  }

  handleUnApprovedSocietyResponse(res: IPagedResponse<ISociety>) {
    this.societies = res.data;
    this.total = res.total;
    this.page = res.page;
    this.limit = res.limit;
  }

  nextPage() {
    if (this.page * this.limit < this.total) {
      this.page++;
      this.loadUnApprovedSocieties();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadUnApprovedSocieties();
    }
  }

  toggleRow(i: number) {
    this.expandedRow = this.expandedRow === i ? null : i;
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

  approve(society: ISociety) {
    this.societyService.approveSociety(society._id)
    .pipe(take(1))
    .subscribe(() => this.loadUnApprovedSocieties())
  }

  reject(society: ISociety) {
    this.societyService.rejectSociety(society._id)
    .pipe(take(1))
    .subscribe(() => this.loadUnApprovedSocieties())
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
