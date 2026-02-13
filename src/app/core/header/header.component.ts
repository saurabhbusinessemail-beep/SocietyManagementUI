import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Mode } from '../../types';
import { ConsoleCaptureService } from '../../services/console-capture.service';
import { MatDialog } from '@angular/material/dialog';
import { ConsoleComponent } from '../console/console.component';
import { LocalStorageComponent } from '../storage/local-storage.component';
import { WindowService } from '../../services/window.service';
import { PushNotificationService } from '../../services/push-notification.service';
import { ApiTrackerComponent } from '../api-tracker/api-tracker.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  @Input() title: string = '';
  @Input() hideMoreActions: boolean = false;
  @Input() showSocietyFilter = false;
  @Output() toggleMenu = new EventEmitter<void>();

  // center dropdown example
  dropdownOptions = ['Option A', 'Option B', 'Option C'];
  selected = this.dropdownOptions[0];
  showDevButtons = false;

  constructor(
    public ccs: ConsoleCaptureService,
    private dialog: MatDialog,
    public windowServic: WindowService,
    private pushNotificationService: PushNotificationService
  ) { }

  ngOnInit(): void {
  }

  onMenuClick() {
    this.toggleMenu.emit();
  }

  onSelectChange(val: string) {
    this.selected = val;
  }

  showApiCalls() {
    this.dialog.open(ApiTrackerComponent, { width: '90%', height: '80vh' })
  }

  showLogs() {
    this.dialog.open(ConsoleComponent, { width: '90%', height: '80vh' })
  }

  showStorage() {
    this.dialog.open(LocalStorageComponent, { width: '90%', height: '80vh' })
  }

  // async initilizeWebNotificationPermission() {
  //   await this.pushNotificationService.initializeWeb()
  // }
}
