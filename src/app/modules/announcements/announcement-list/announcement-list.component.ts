import { Component, OnInit, OnDestroy } from '@angular/core';
import { IAnnouncement, IAnnouncementFilters, IMyProfile, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { AnnouncementService } from '../../../services/announcement.service';
import { FormControl } from '@angular/forms';
import { filter, take, Subject, takeUntil } from 'rxjs';
import { AnnouncementCategoryTypesText, AnnouncementCategoryTypes, AnnouncementPriorityTypes, AnnouncementPriorityTypesText, AnnouncementStatusTypes, AnnouncementStatusTypesText, adminManagerRoles } from '../../../constants';
import { LoginService } from '../../../services/login.service';
import { SocietyRoles } from '../../../types';
import { Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-announcement-list',
  templateUrl: './announcement-list.component.html',
  styleUrl: './announcement-list.component.scss'
})
export class AnnouncementListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  myProfile: IMyProfile | undefined;
  societyRole?: 'admin' | SocietyRoles;
  announcements: IAnnouncement[] = [];
  selectedFIlter?: IAnnouncementFilters;

  loadingAnnouncements = true;
  loadingAnnouncementAction: { [annoucementId: string]: boolean } = {};

  categoryControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  categoryConfig!: IUIControlConfig<IUIDropdownOption | undefined | null>;

  priorityControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  priorityConfig!: IUIControlConfig<IUIDropdownOption | undefined | null>;

  statusControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  statusConfig!: IUIControlConfig<IUIDropdownOption | undefined | null>;

  isPinnedControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  isPinnedConfig!: IUIControlConfig<IUIDropdownOption | undefined | null>;

  get hideMoreAction(): boolean {
    return this.societyRole === SocietyRoles.member;
  }

  constructor(
    private announcementService: AnnouncementService,
    private loginService: LoginService,
    private router: Router,
    public societyService: SocietyService,
    private translate: TranslateService
  ) { }

  initFilterConfigs() {
    this.categoryConfig = {
      id: 'category',
      label: this.translate.instant('ANNOUNCEMENTS.CATEGORY') || 'Category',
      placeholder: this.translate.instant('ANNOUNCEMENTS.SELECT_CATEGORY') || 'Select Category',
      formControl: this.categoryControl,
      dropDownOptions: [
        {
          label: this.translate.instant('ANNOUNCEMENTS.CAT_BILLING') || 'Billing',
          value: AnnouncementCategoryTypes.billing
        },
        {
          label: this.translate.instant('ANNOUNCEMENTS.CAT_EVENT') || 'Event',
          value: AnnouncementCategoryTypes.event
        },
        {
          label: this.translate.instant('ANNOUNCEMENTS.CAT_GENERAL') || 'General',
          value: AnnouncementCategoryTypes.general
        },
        {
          label: this.translate.instant('ANNOUNCEMENTS.CAT_MAINTENANCE') || 'Maintenance',
          value: AnnouncementCategoryTypes.maintenance
        },
        {
          label: this.translate.instant('ANNOUNCEMENTS.CAT_OTHER') || 'Other',
          value: AnnouncementCategoryTypes.other
        },
        {
          label: this.translate.instant('ANNOUNCEMENTS.CAT_SECURITY') || 'Security',
          value: AnnouncementCategoryTypes.security
        },
      ]
    };

    this.priorityConfig = {
      id: 'priority',
      label: this.translate.instant('ANNOUNCEMENTS.PRIORITY') || 'Priority',
      placeholder: this.translate.instant('ANNOUNCEMENTS.SELECT_PRIORITY') || 'Select Priority',
      formControl: this.priorityControl,
      dropDownOptions: [
        {
          label: this.translate.instant('COMPLAINTS.PRIORITY_' + AnnouncementPriorityTypes.low.toUpperCase()) || AnnouncementPriorityTypesText.low,
          value: AnnouncementPriorityTypes.low.toString()
        },
        {
          label: this.translate.instant('COMPLAINTS.PRIORITY_' + AnnouncementPriorityTypes.medium.toUpperCase()) || AnnouncementPriorityTypesText.medium,
          value: AnnouncementPriorityTypes.medium.toString()
        },
        {
          label: this.translate.instant('COMPLAINTS.PRIORITY_' + AnnouncementPriorityTypes.high.toUpperCase()) || AnnouncementPriorityTypesText.high,
          value: AnnouncementPriorityTypes.high.toString()
        },
        {
          label: this.translate.instant('COMPLAINTS.PRIORITY_' + AnnouncementPriorityTypes.urgent.toUpperCase()) || AnnouncementPriorityTypesText.urgent,
          value: AnnouncementPriorityTypes.urgent.toString()
        }
      ]
    };

    this.statusConfig = {
      id: 'status',
      label: this.translate.instant('COMMON.STATUS') || 'Status',
      placeholder: this.translate.instant('ANNOUNCEMENTS.SELECT_STATUS') || 'Select Status',
      formControl: this.statusControl,
      dropDownOptions: [
        {
          label: this.translate.instant('ANNOUNCEMENTS.STATUS_DRAFT') || 'Draft',
          value: AnnouncementStatusTypes.draft.toString()
        },
        {
          label: this.translate.instant('ANNOUNCEMENTS.STATUS_PUBLISHED') || 'Published',
          value: AnnouncementStatusTypes.published.toString()
        },
        {
          label: this.translate.instant('ANNOUNCEMENTS.STATUS_ARCHIVED') || 'Archived',
          value: AnnouncementStatusTypes.archived.toString()
        },
      ]
    };

    this.isPinnedConfig = {
      id: 'isPinned',
      label: this.translate.instant('ANNOUNCEMENTS.PINNED') || 'Pinned',
      formControl: this.isPinnedControl,
      dropDownOptions: [
        {
          label: this.translate.instant('ANNOUNCEMENTS.PINNED') || 'Pinned',
          value: true
        },
        {
          label: this.translate.instant('ANNOUNCEMENTS.UNPINNED') || 'Unpinned',
          value: false
        },
      ]
    };
  }

  ngOnInit(): void {
    this.initFilterConfigs();
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.initFilterConfigs();
    });

    this.myProfile = this.loginService.getProfileFromStorage();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnnouncements(selectedFIlter: IAnnouncementFilters) {
    this.selectedFIlter = selectedFIlter;
    this.announcements = [];
    if (selectedFIlter.societyId === undefined) return;

    this.resetSelectedSocietyRole(selectedFIlter.societyId);
    if (this.societyRole === SocietyRoles.member) {
      selectedFIlter.status = 'published'
    }

    this.loadingAnnouncements = true;
    this.announcementService.getSocietyAnnouncements(selectedFIlter)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.loadingAnnouncements = false;
          if (!response.success) return;

          this.announcements = response.data;
        },
        error: err => {
          this.loadingAnnouncements = false;
        }
      });
  }

  resetSelectedSocietyRole(societyId: string) {
    this.societyRole = undefined;
    if (!this.myProfile) return;

    if (this.myProfile.user.role === 'admin') {
      this.societyRole = 'admin';
      return;
    }

    const socities = this.myProfile.socities;
    const society = socities.find(s => s.societyId === societyId);
    if (!society) return;

    if (society.societyRoles.some(sr => adminManagerRoles.includes(sr.name)))
      this.societyRole = SocietyRoles.manager;
    else
      this.societyRole = SocietyRoles.member;
  }

  viewAnnouncement(announcement: IAnnouncement) {
    this.router.navigate(['announcements', announcement._id]);
  }

  editAnnouncement(announcement: IAnnouncement) {
    this.router.navigate(['announcements/edit', announcement._id]);
  }

  deleteAnnouncement(announcement: IAnnouncement) {
    this.loadingAnnouncementAction[announcement._id] = true;
    this.announcementService.deleteAnnouncement(announcement._id)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.loadingAnnouncementAction[announcement._id] = false;
          if (!response.success || !this.selectedFIlter) return;

          this.loadAnnouncements(this.selectedFIlter)
        },
        error: err => this.loadingAnnouncementAction[announcement._id] = false
      })
  }

  togglePinAnnouncement(announcement: IAnnouncement) {
    this.loadingAnnouncementAction[announcement._id] = true;
    this.announcementService.togglePinAnnouncement(announcement._id)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.loadingAnnouncementAction[announcement._id] = false;
          if (!response.success || !this.selectedFIlter) return;

          this.loadAnnouncements(this.selectedFIlter)
        },
        error: err => this.loadingAnnouncementAction[announcement._id] = false
      })
  }
}
