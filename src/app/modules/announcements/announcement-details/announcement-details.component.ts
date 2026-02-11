import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { IAnnouncement, IMyProfile, ISociety, IUser } from '../../../interfaces';
import { SocietyRoles } from '../../../types';
import { AnnouncementService } from '../../../services/announcement.service';
import { LoginService } from '../../../services/login.service';
import { adminManagerRoles } from '../../../constants';

@Component({
  selector: 'app-announcement-details',
  templateUrl: './announcement-details.component.html',
  styleUrls: ['./announcement-details.component.scss']
})
export class AnnouncementDetailsComponent implements OnInit, OnDestroy {

  myProfile: IMyProfile | undefined;
  announcementId?: string | null;
  announcement?: IAnnouncement;
  isLoading = false;
  error: string = '';
  viewerRole?: 'admin' | SocietyRoles = SocietyRoles.member;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private announcementService: AnnouncementService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.announcementId = this.route.snapshot.paramMap.get('id');
    this.myProfile = this.loginService.getProfileFromStorage();

    if (this.announcementId) {
      this.getAnnouncement(this.announcementId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAnnouncement(id: string): void {
    this.isLoading = true;
    this.announcementService.getAnnouncement(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.announcement = data.data;
          this.isLoading = false;
          if (this.announcement) {
            const societyId = typeof this.announcement.societyId === 'string' ? this.announcement.societyId : this.announcement.societyId._id
            this.resetSelectedSocietyRole(societyId);
          }
        },
        error: (error) => {
          this.error = 'Failed to load announcement';
          this.isLoading = false;
          console.error('Error loading announcement:', error);
        }
      });
  }

  get createdByUser(): IUser | undefined {
    return typeof this.announcement?.createdByUserId === 'string'
      ? undefined
      : this.announcement?.createdByUserId;
  }

  get society(): ISociety | undefined {
    return typeof this.announcement?.societyId !== 'string'
      ? this.announcement?.societyId
      : undefined;
  }

  get isAdminView(): boolean {
    return this.viewerRole === SocietyRoles.societyadmin ||
      this.viewerRole === SocietyRoles.manager ||
      this.viewerRole === 'admin';
  }

  get isExpired(): boolean {
    if (!this.announcement?.expiryDate) return false;
    return new Date(this.announcement.expiryDate) < new Date();
  }

  get statusClass(): string {
    return `status-${this.announcement?.status}`;
  }

  get priorityClass(): string {
    return `priority-${this.announcement?.priority}`;
  }

  get categoryClass(): string {
    return `category-${this.announcement?.category}`;
  }

  resetSelectedSocietyRole(societyId: string) {
    this.viewerRole = undefined;
    if (!this.myProfile) return;

    if (this.myProfile.user.role === 'admin') {
      this.viewerRole = 'admin';
      return;
    }

    const socities = this.myProfile.socities;
    const society = socities.find(s => s.societyId === societyId);
    if (!society) return;

    if (society.societyRoles.some(sr => adminManagerRoles.includes(sr.name)))
      this.viewerRole = SocietyRoles.manager;
    else
      this.viewerRole = SocietyRoles.member;
  }

  onEditClick(): void {
    if (!this.announcement) return;

    this.router.navigate(['announcements/edit', this.announcement._id]);
  }

  onUnpublishClick(): void {
    if (!this.announcement) return;

    this.announcementService.unpublishAnnouncement(this.announcement._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (!this.announcement) return;

          this.announcement.status = 'draft';
          this.announcement.isPublished = false;
        },
        error: (error) => {
          console.error('Error updating pin status:', error);
        }
      });
  }

  onPinClick(): void {
    if (!this.announcement) return;

    this.announcementService.togglePinAnnouncement(this.announcement._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (!this.announcement) return;

          this.announcement.isPinned = !this.announcement.isPinned;
        },
        error: (error) => {
          console.error('Error updating pin status:', error);
        }
      });
  }
  deleteAnnouncement() {
    if (!this.announcement) return;

    this.announcementService.deleteAnnouncement(this.announcement._id)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.goBack();
        }
      })
  }

  goBack(): void {
    this.router.navigate(['/announcements']);
  }
}