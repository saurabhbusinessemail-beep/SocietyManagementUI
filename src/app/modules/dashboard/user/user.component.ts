// user.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISociety } from '../../../interfaces';
import { Subject, take } from 'rxjs';
import { SocietyService } from '../../../services/society.service';
import { Router } from '@angular/router';
import { SocietyRoles } from '../../../types';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit, OnDestroy {

  roles: { role: string; label: string; icon: string }[] = [
    {
      role: SocietyRoles.owner,
      label: 'Flat Owner',
      icon: 'home'
    },
    {
      role: SocietyRoles.tenant,
      label: 'Tenant',
      icon: 'tenant'
    },
    {
      role: SocietyRoles.security,
      label: 'Security',
      icon: 'security'
    }
  ];

  isSocitiesLoading = false;
  societies: ISociety[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private societyService: SocietyService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // this.societyService.selectSocietyFilter(undefined);
    this.loadSocieties();
  }

  loadSocieties() {
    this.isSocitiesLoading = true;
    this.societyService.getAllSocieties()
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.societies = response.data ?? [];
          this.isSocitiesLoading = false;

          if (this.societies.length > 0 && !this.societyService.selectedSocietyFilterValue) {
            const s = this.societies[0];
            this.societyService.selectSocietyFilter({ label: s.societyName, value: s._id });
          }
        },
        error: () => {
          console.log('Error while getting societies');
          this.isSocitiesLoading = false;
        }
      });
  }

  navigateToJoin(role: string) {
    this.router.navigate(['/join', role]);
  }

  navigateToAddSociety() {
    this.router.navigate(['society-public', 'add']);
  }

  handleSocietyClick(society: ISociety) {
    this.societyService.handleSocietyClick(society);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}