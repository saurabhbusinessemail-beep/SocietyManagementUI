import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocietyService } from '../../../services/society.service';
import { Subject, take } from 'rxjs';
import { ISociety } from '../../../interfaces';
import { PERMISSIONS } from '../../../constants';
import { LoginService } from '../../../services/login.service';

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

  constructor(private societyService: SocietyService, private loginService: LoginService) { }

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

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }

}
