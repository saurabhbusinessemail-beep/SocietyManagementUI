import { Component, OnDestroy, OnInit } from '@angular/core';
import { IGatePass, IUser } from '../../../interfaces';
import { BehaviorSubject, Subject, debounceTime, take, takeUntil } from 'rxjs';
import { GatePassService } from '../../../services/gate-pass.service';
import { MatDialog } from '@angular/material/dialog';
import { QRViewerComponent } from '../../../core/qrviewer/qrviewer.component';
import { DialogService } from '../../../services/dialog.service';

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

  constructor(
    private gatepassService: GatePassService,
    private dialog: MatDialog,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
  }

  getGatePassUser(gatePass: IGatePass): IUser | undefined {
    return gatePass.userId && typeof gatePass.userId !== 'string' ? gatePass.userId : undefined;
  }

  loadGatePasses(selectedFIlter: IGatePassFilter) {
    this.selectedFIlter = selectedFIlter;
    const societyId = selectedFIlter.societyId;
    const flatId = selectedFIlter.flatId;

    this.gatepassService.getGattePasses(societyId, flatId)
      .pipe(take(1))
      .subscribe({
        next: response => {
          this.gatepasses = response.data;
        }
      });
  }

  async deletePass(gatePass: IGatePass) {
    const forUser = typeof gatePass.userId === 'string' ? undefined : ` for ${gatePass.userId.name ?? gatePass.userId.phoneNumber}`

    if (!await this.dialogService.confirmDelete('Delete Gate Pass', `Are you sure you want to delete this gate pass ${forUser}?`)) return;

    this.gatepassService.deleteGatePass(gatePass._id)
      .pipe(take(1))
      .subscribe(response => {
        if (!response.success) return;

        this.loadGatePasses(this.selectedFIlter);
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
