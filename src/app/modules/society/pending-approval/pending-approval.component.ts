import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { IMyProfile, IUIDropdownOption } from '../../../interfaces';
import { LoginService } from '../../../services/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pending-approval',
  templateUrl: './pending-approval.component.html',
  styleUrl: './pending-approval.component.scss'
})
export class PendingApprovalComponent implements OnInit, OnDestroy {
  private loginService = inject(LoginService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  myProfile?: IMyProfile;
  routeTabId: string = '';
  tabsOptions: IUIDropdownOption[] = [];

  isComponentActive = new Subject<void>();

  get isAdmin(): boolean {
    return this.myProfile?.user.role === 'admin'
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(paramMap => {
        this.routeTabId = paramMap.get('tabId') ?? '';
        if (!this.routeTabId) {
          this.router.navigate(['society', 'pendingApproval', 'socities'])
        };
      });

    this.myProfile = this.loginService.getProfileFromStorage();

    this.translate.onLangChange
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(() => {
        this.updateTabsOptions();
      });
    this.updateTabsOptions();
  }

  updateTabsOptions() {
    this.tabsOptions = [
      { label: this.translate.instant('APPROVALS.SOCIETY_APPROVALS') || 'Society Approvals', value: 'societies' },
      { label: this.translate.instant('APPROVALS.FLAT_APPROVALS') || 'Flat Approvals', value: 'flats' },
      { label: this.translate.instant('APPROVALS.SECURITY_APPROVALS') || 'Security Approvals', value: 'security' }
    ];
  }

  handleTabChange(tabId: string) {
    this.router.navigate(['society/pendingApproval', tabId]);
  }


  gotoAddSociety() {
    this.router.navigateByUrl('/society-public/add')
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
