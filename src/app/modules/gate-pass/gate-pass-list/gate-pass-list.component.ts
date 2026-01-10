import { Component, OnDestroy, OnInit } from '@angular/core';
import { IGatePass, IUIControlConfig, IUIDropdownOption, IUser } from '../../../interfaces';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subject, debounceTime, take, takeUntil } from 'rxjs';
import { GatePassService } from '../../../services/gate-pass.service';
import { SocietyService } from '../../../services/society.service';

@Component({
  selector: 'app-gate-pass-list',
  templateUrl: './gate-pass-list.component.html',
  styleUrl: './gate-pass-list.component.scss'
})
export class GatePassListComponent implements OnInit, OnDestroy {

  isComponentActive = new Subject<void>();
  gatepasses: IGatePass[] = [];
  triggerSocietyLoad = new BehaviorSubject<string>('');

  societiesSearchControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  flatControl = new FormControl<IUIDropdownOption | undefined>(undefined);

  societyOptions: IUIDropdownOption[] = [];
  flatOptions: IUIDropdownOption[] = [];

  societiesSearchConfig: IUIControlConfig = {
    id: 'society',
    label: 'Society',
    placeholder: 'Search Society',
  };
  flatSearchConfig: IUIControlConfig = {
    id: 'flat',
    label: 'Flat',
    placeholder: 'Search Flat',
  };

  constructor(
    private gatepassService: GatePassService,
    private societyService: SocietyService
  ) { }

  ngOnInit(): void {

    this.subscribeToFlatSelection();
    this.subscribeToSocietySelection();
    this.loadMySocities();
    this.loadAllMyFlats();
    this.triggerSocietyLoad
      .pipe(takeUntil(this.isComponentActive), debounceTime(50))
      .subscribe(() => this.loadGatePasses());

    this.triggerSocietyLoad.next('');
  }

  getGatePassUser(gatePass: IGatePass): IUser | undefined {
    return gatePass.userId && typeof gatePass.userId !== 'string' ? gatePass.userId : undefined;
  }

  loadMySocities() {
    this.societyService.getAllSocieties()
      .pipe(take(1))
      .subscribe({
        next: response => {
          const socities = response.data;
          this.societyOptions = socities.map(s => ({
            label: s.societyName,
            value: s._id
          } as IUIDropdownOption));
        }
      });
  }

  loadAllMyFlats(societyId?: string) {
    this.societyService.myFlats(societyId)
      .pipe(take(1))
      .subscribe(response => {
        if (!response.success) return;

        this.flatOptions = response.data.map(flatMember => this.societyService.convertFlatMemberToDropdownOption(flatMember));
      });
  }

  subscribeToFlatSelection() {
    this.flatControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(selectedFlat => {
        this.triggerSocietyLoad.next('');
      });
  }

  subscribeToSocietySelection() {
    this.societiesSearchControl.valueChanges
      .pipe(takeUntil(this.isComponentActive))
      .subscribe(selectedSociety => {
        this.flatControl.reset();

        if (selectedSociety) {
          this.loadAllMyFlats(selectedSociety.value);

        } else {
          this.loadAllMyFlats();
        }
        this.triggerSocietyLoad.next('');

      });
  }

  loadGatePasses() {
    const societyId = this.societiesSearchControl.value?.value;
    const flatId = this.flatControl.value?.value;

    this.gatepassService.getGattePasses(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.gatepasses = response.data;
        }
      });
  }

  deletePass(gatePass: IGatePass) {
    this.gatepassService.deleteGatePass(gatePass._id)
      .pipe(take(1))
      .subscribe(response => {
        if (!response.success) return;

        this.triggerSocietyLoad.next('');
      })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
