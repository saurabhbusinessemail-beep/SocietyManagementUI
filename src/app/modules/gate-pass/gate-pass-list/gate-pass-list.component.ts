import { Component, OnDestroy, OnInit } from '@angular/core';
import { IGatePass, IUser } from '../../../interfaces';
import { BehaviorSubject, Subject, debounceTime, take, takeUntil } from 'rxjs';
import { GatePassService } from '../../../services/gate-pass.service';
import { MatDialog } from '@angular/material/dialog';
import { QRViewerComponent } from '../../../core/qrviewer/qrviewer.component';
import { DialogService } from '../../../services/dialog.service';
import { SocietyService } from '../../../services/society.service';
import { ActivatedRoute, Router } from '@angular/router';

interface IGatePassFilter {
  societyId?: string, flatId?: string
}

@Component({
  selector: 'app-gate-pass-list',
  templateUrl: './gate-pass-list.component.html',
  styleUrl: './gate-pass-list.component.scss'
})
export class GatePassListComponent implements OnInit, OnDestroy {

  selectedFIlter: IGatePassFilter = {};
  isComponentActive = new Subject<void>();
  gatepasses: IGatePass[] = [];

  loadingGatePasses = true;
  loadingGatePassActions: { [gatePassId: string]: boolean } = {};

  routeFlatId?: string;
  selectedFilterChanged = new BehaviorSubject<IGatePassFilter | undefined>(undefined);

  constructor(
    private gatepassService: GatePassService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    public societyService: SocietyService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.routeFlatId = this.route.snapshot.paramMap.get('flatId') ?? '';
    this.subscribeToSelectedFilterChanged();
  }

  getGatePassUser(gatePass: IGatePass): IUser | undefined {
    return gatePass.userId && typeof gatePass.userId !== 'string' ? gatePass.userId : undefined;
  }

  subscribeToSelectedFilterChanged() {
    this.selectedFilterChanged
      .pipe(
        debounceTime(300),
        takeUntil(this.isComponentActive)
      )
      .subscribe(selectedFIlter => {
        if (!selectedFIlter) return;

        this.loadGatePasses(selectedFIlter);
      })
  }

  async openAddGatePass() {
    const societyId = this.selectedFIlter.societyId ?? this.societyService.selectedSocietyFilterValue?.value;
    const flatId = this.routeFlatId ?? this.selectedFIlter.flatId;

    if (societyId && flatId)
      this.router.navigate(['gatepass', societyId, 'add', flatId]);
    else if (societyId)
      this.router.navigate(['gatepass', societyId, 'add']);
  }


  handleSelectedFilterChanged(selectedFIlter: IGatePassFilter) {
    this.selectedFilterChanged.next(selectedFIlter);
  }

  loadGatePasses(selectedFIlter: IGatePassFilter) {
    this.selectedFIlter = selectedFIlter;
    const societyId = selectedFIlter.societyId;
    const flatId = selectedFIlter.flatId;
    this.gatepasses = [];
    this.loadingGatePasses = true;

    this.gatepassService.getGattePasses(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.gatepasses = response.data;
          this.loadingGatePasses = false;
        },
        error: err => {
          this.loadingGatePasses = false;
        }
      });
  }

  async deletePass(gatePass: IGatePass) {
    const forUser = typeof gatePass.userId === 'string' ? undefined : ` for ${gatePass.userId.name ?? gatePass.userId.phoneNumber}`

    if (!await this.dialogService.confirmDelete('Delete Gate Pass', `Are you sure you want to delete this gate pass ${forUser}?`)) return;

    this.loadingGatePassActions[gatePass._id] = true;
    this.gatepassService.deleteGatePass(gatePass._id)
      .pipe(take(1))
      .subscribe({
        next: response => {
          if (!response.success) return;

          this.loadingGatePassActions[gatePass._id] = false;
          this.loadGatePasses(this.selectedFIlter);
        },
        error: err => {
          this.loadingGatePassActions[gatePass._id] = false;
        }
      })
  }

  showQR(gatePass: IGatePass) {
    let qrData = {};
    let label = '';
    let value = '';

    if (gatePass.isAssignedBySociety) {
      qrData = {
        gatePassId: gatePass._id
      }
      label = 'Gate Pass'
      value = gatePass._id;

    } else {
      qrData = {
        otp: gatePass.otp,
        societyId: typeof gatePass.societyId === 'string' ? gatePass.societyId : gatePass.societyId._id,
        flatId: typeof gatePass.flatId === 'string' ? gatePass.flatId : gatePass.flatId._id
      };
      label = 'OTP';
      value = gatePass.otp.toString();
    }

    this.dialog.open(QRViewerComponent, {
      data: {
        qrCodeString: JSON.stringify(qrData),
        label, value
      }
    })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
