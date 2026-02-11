import { Component, OnDestroy, OnInit } from '@angular/core';
import { IComplaint, IFlat, IMyProfile, ISociety, ISocietyRole, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Subject, take } from 'rxjs';
import { ComplaintService } from '../../../services/complaint.service';
import { adminManagerRoles } from '../../../constants';

interface IComplaintFilter {
  societyId?: string, flatId?: string, complaintType?: string
}

@Component({
  selector: 'app-complaint-list',
  templateUrl: './complaint-list.component.html',
  styleUrl: './complaint-list.component.scss'
})
export class ComplaintListComponent implements OnInit, OnDestroy {

  complaints: IComplaint[] = [];

  myProfile?: IMyProfile;
  societyOptions: IUIDropdownOption[] = [];
  flatOptions: IUIDropdownOption[] = [];
  complaintTypeOptions: IUIDropdownOption[] = [
    {
      label: 'All',
      value: undefined
    },
    {
      label: 'Private',
      value: 'Private'
    },
    {
      label: 'Public',
      value: 'Public'
    }
  ];

  selectedFIlter: IComplaintFilter = {};
  isFlatMember: boolean = false;

  protected isComponentActive = new Subject<void>();

  complaintTypeControl = new FormControl<IUIDropdownOption | undefined | null>(this.complaintTypeOptions[0]);

  complaintTypeConfig: IUIControlConfig<IUIDropdownOption | undefined | null> = {
    id: 'complaintType',
    label: 'Complaint Type',
    formControl: this.complaintTypeControl,
    dropDownOptions: this.complaintTypeOptions
  };

  constructor(
    private loginService: LoginService,
    private router: Router,
    private complaintService: ComplaintService
  ) { }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();
    if (!this.myProfile) {
      this.router.navigateByUrl('/');
      return;
    }
  }

  getSociety(complaint: IComplaint): ISociety | undefined {
    return typeof complaint.societyId === 'string' ? undefined : complaint.societyId
  }

  getFlat(complaint: IComplaint): IFlat | undefined {
    return typeof complaint.flatId === 'string' ? undefined : complaint.flatId
  }

  isStatusTransitionAllowed(complaint: IComplaint, nextStatus: string): boolean {
    return this.complaintService.isStatusTransitionAllowed(complaint.status, nextStatus);
  }

  amIManagerOfSociety(complaint: IComplaint) {
    const societyId = typeof complaint.societyId === 'string' ? complaint.societyId : complaint.societyId._id;

    if (!this.myProfile) return false;

    return this.myProfile.socities
      .find(s => s.societyId === societyId)
      ?.societyRoles?.some(sr => adminManagerRoles.includes(sr.name))
      ?? false;
  }

  isMyComplaint(complaint: IComplaint) {
    const createdByUserId = typeof complaint.createdByUserId === 'string' ? complaint.createdByUserId : complaint.createdByUserId._id;
    if (!this.myProfile) return false;

    return this.myProfile.user._id === createdByUserId;
  }

  async openAddComplaint() {
    const societyId = this.selectedFIlter.societyId;
    const flatId = this.selectedFIlter.flatId;

    if (societyId && flatId)
      this.router.navigate(['complaints', societyId, 'add', flatId]);
    else if (societyId)
      this.router.navigate(['complaints', societyId, 'add']);
    else if (flatId)
      this.router.navigate(['complaints', 'add', flatId]);
    else
      this.router.navigate(['complaints', 'add']);
  }

  loadComplaints(selectedFilter: IComplaintFilter) {
    this.selectedFIlter = selectedFilter;
    this.complaints = [];
    this.complaintService.getComplaints(selectedFilter.societyId, selectedFilter.flatId, selectedFilter.complaintType)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.complaints = response.data
        }
      });
  }

  changeStatus(complaint: IComplaint, newStatus: string) {
    if (!this.isStatusTransitionAllowed(complaint, newStatus)) return;

    this.complaintService.changeStatus(complaint._id, newStatus)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (response.success) this.loadComplaints(this.selectedFIlter);
        }
      })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
