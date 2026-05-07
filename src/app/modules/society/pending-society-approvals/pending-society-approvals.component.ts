import { Component, OnDestroy, OnInit } from '@angular/core';
import { IMyProfile, IPagedResponse, ISociety } from '../../../interfaces';
import { SocietyService } from '../../../services/society.service';
import { FormControl } from '@angular/forms';
import { debounceTime, merge, of, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';

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
  statusControl = new FormControl<string>('pending');
  isComponentActive = new Subject<void>();
  private refreshSubject = new Subject<void>();
  loading = false;

  expandedRow: number | null = null;

  get isAdmin(): boolean {
    return this.myProfile?.user.role === 'admin'
  }

  get totalPages() {
    return Math.ceil(this.total / this.limit);
  }

  get paginatedSocieties() {
    return this.societies;
  }

  constructor(private societyService: SocietyService, private loginService: LoginService, private router: Router) { }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();

    merge(
      this.searchControl.valueChanges.pipe(debounceTime(500)),
      this.statusControl.valueChanges,
      this.refreshSubject,
      of(null)
    ).pipe(
      takeUntil(this.isComponentActive),
      tap(() => this.loading = true),
      switchMap(() => this.getUnApprovedSocietyApiCall()),
    ).subscribe({
      next: res => {
        this.handleUnApprovedSocietyResponse(res);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading societies:', err);
        this.loading = false;
      }
    });
  }

  getUnApprovedSocietyApiCall() {
    const selectedStatus = this.statusControl.value ?? 'pending';
    const searchText = this.searchControl.value ?? '';
    return this.isAdmin ? this.societyService.getAllUnApprovedSocieties(selectedStatus, this.page, this.limit, searchText)
    : this.societyService.getMySocietiesForApproval(selectedStatus, this.page, this.limit, searchText)
  }

  loadUnApprovedSocieties() {
    this.refreshSubject.next();
  }

  handleUnApprovedSocietyResponse(res: IPagedResponse<ISociety>) {
    this.societies = res.data;
    this.total = res.total;
    this.page = res.page;
    this.limit = res.limit;
  }

  gotoAddSociety() {
    this.router.navigateByUrl('/society-public/add')
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
