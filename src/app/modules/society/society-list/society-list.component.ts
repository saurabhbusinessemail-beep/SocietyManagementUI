import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocietyService } from '../../../services/society.service';
import { Subject, take } from 'rxjs';
import { ISociety } from '../../../interfaces';
import { PERMISSIONS, ownerMemberTenanRoles } from '../../../constants';
import { LoginService } from '../../../services/login.service';
import { Router } from '@angular/router';
import { SocietyRoles } from '../../../types';

@Component({
  selector: 'app-society-list',
  templateUrl: './society-list.component.html',
  styleUrl: './society-list.component.scss'
})
export class SocietyListComponent implements OnInit, OnDestroy {

  isComponentActive = new Subject<void>();
  socities: ISociety[] = [];

  get canAddSociety(): boolean {
    return this.loginService.hasPermission(PERMISSIONS.society_add);
  }

  constructor(private societyService: SocietyService, private loginService: LoginService, private router: Router) { }

  ngOnInit(): void {
    this.loadSocities();
  }

  loadSocities() {
    this.societyService.getAllSocieties()
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.socities = response.data ?? [];
        },
        error: () => console.log('Error while getting socities')
      });
  }

  handleSocietyClick(society: ISociety) {
    const profile = this.loginService.getProfileFromStorage();
    if (!profile) return;

    if (profile.user.role === 'admin') {
      this.router.navigate(['/society', society._id, 'details']);
      return;
    }

    const societyRoles = profile.socities.find(s => s.societyId === society._id)?.societyRoles
    if (!societyRoles) return;

    const hasManagerialRole = societyRoles.some(sr => sr.name === 'societyadmin' || sr.name === SocietyRoles.manager);
    const hasNonManagerialRole = societyRoles.some(sr => ownerMemberTenanRoles.includes(sr.name));

    if (hasManagerialRole) {
      this.router.navigate(['/society', society._id, 'details']);
    } else if (hasNonManagerialRole) {
      this.router.navigate(['/myflats', society._id, 'list']);
    }
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }

}
