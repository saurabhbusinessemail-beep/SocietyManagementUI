import { Component, OnInit } from '@angular/core';
import { IAnnouncement, IAnnouncementFilters, IMyProfile, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { AnnouncementService } from '../../../services/announcement.service';
import { FormControl } from '@angular/forms';
import { filter, take } from 'rxjs';
import { AnnouncementCategoryTypesText, AnnouncementCategoryTypes, AnnouncementPriorityTypes, AnnouncementPriorityTypesText, AnnouncementStatusTypes, AnnouncementStatusTypesText, adminManagerRoles } from '../../../constants';
import { LoginService } from '../../../services/login.service';
import { SocietyRoles } from '../../../types';
import { Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';

@Component({
  selector: 'app-announcement-list',
  templateUrl: './announcement-list.component.html',
  styleUrl: './announcement-list.component.scss'
})
export class AnnouncementListComponent implements OnInit {


  myProfile: IMyProfile | undefined;
  societyRole?: 'admin' | SocietyRoles;
  announcements: IAnnouncement[] = [];
  selectedFIlter?: IAnnouncementFilters;

  loadingAnnouncements = true;
  loadingAnnouncementAction: { [annoucementId: string]: boolean } = {};

  categoryControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  categoryConfig: IUIControlConfig<IUIDropdownOption | undefined | null> = {
    id: 'category',
    label: 'Category',
    placeholder: 'Select Category',
    formControl: this.categoryControl,
    dropDownOptions: [
      {
        label: AnnouncementCategoryTypesText.billing.toString(),
        value: AnnouncementCategoryTypes.billing
      },
      {
        label: AnnouncementCategoryTypesText.event.toString(),
        value: AnnouncementCategoryTypes.event
      },
      {
        label: AnnouncementCategoryTypesText.general.toString(),
        value: AnnouncementCategoryTypes.general
      },
      {
        label: AnnouncementCategoryTypesText.maintenance.toString(),
        value: AnnouncementCategoryTypes.maintenance
      },
      {
        label: AnnouncementCategoryTypesText.other.toString(),
        value: AnnouncementCategoryTypes.other
      },
      {
        label: AnnouncementCategoryTypesText.security.toString(),
        value: AnnouncementCategoryTypes.security
      },
    ]
  };

  priorityControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  priorityConfig: IUIControlConfig<IUIDropdownOption | undefined | null> = {
    id: 'priority',
    label: 'Priority',
    placeholder: 'Select Priority',
    formControl: this.priorityControl,
    dropDownOptions: [
      {
        label: AnnouncementPriorityTypesText.low.toString(),
        value: AnnouncementPriorityTypes.low.toString()
      },
      {
        label: AnnouncementPriorityTypesText.medium.toString(),
        value: AnnouncementPriorityTypes.medium.toString()
      },
      {
        label: AnnouncementPriorityTypesText.high.toString(),
        value: AnnouncementPriorityTypes.high.toString()
      },
      {
        label: AnnouncementPriorityTypesText.urgent.toString(),
        value: AnnouncementPriorityTypes.urgent.toString()
      }
    ]
  };

  statusControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  statusConfig: IUIControlConfig<IUIDropdownOption | undefined | null> = {
    id: 'status',
    label: 'Status',
    placeholder: 'Select Status',
    formControl: this.statusControl,
    dropDownOptions: [
      {
        label: AnnouncementStatusTypesText.draft.toString(),
        value: AnnouncementStatusTypes.draft.toString()
      },
      {
        label: AnnouncementStatusTypesText.published.toString(),
        value: AnnouncementStatusTypes.published.toString()
      },
      {
        label: AnnouncementStatusTypesText.archived.toString(),
        value: AnnouncementStatusTypes.archived.toString()
      },
    ]
  };


  isPinnedControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  isPinnedConfig: IUIControlConfig<IUIDropdownOption | undefined | null> = {
    id: 'isPinned',
    label: 'Pinned',
    formControl: this.isPinnedControl,
    dropDownOptions: [
      {
        label: 'Pinned',
        value: true
      },
      {
        label: 'Unpinned',
        value: false
      },
    ]
  };

  get hideMoreAction(): boolean {
    return this.societyRole === SocietyRoles.member;
  }

  constructor(
    private announcementService: AnnouncementService,
    private loginService: LoginService,
    private router: Router,
    public societyService: SocietyService
  ) { }

  ngOnInit(): void {
    this.myProfile = this.loginService.getProfileFromStorage();
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
