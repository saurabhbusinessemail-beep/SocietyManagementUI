import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocietyService } from '../../../services/society.service';
import { Subject, take } from 'rxjs';
import { ISociety } from '../../../interfaces';
import { MenuService } from '../../../services/menu.service';
import { PERMISSIONS } from '../../../constants';

@Component({
  selector: 'app-society-list',
  templateUrl: './society-list.component.html',
  styleUrl: './society-list.component.scss'
})
export class SocietyListComponent implements OnInit, OnDestroy {

  isComponentActive = new Subject<void>();
  socities: ISociety[] = [];

  get canAddSociety(): boolean {
    return this.menuService.hasPermission(PERMISSIONS.society_add);
  }

  constructor(private router: Router, private societyService: SocietyService, private menuService: MenuService) { }

  ngOnInit(): void {
    this.loadSocities();
  }

  loadSocities() {
    this.societyService.getAllSocieties()
      .pipe(take(1))
      .subscribe({
        next: socities => {
          console.log('socities = ', socities)
          this.socities = socities;
        },
        error: () => console.log('Error while getting socities')
      });
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }

}
