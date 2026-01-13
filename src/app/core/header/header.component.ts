import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { Mode } from '../../types';
import { LoginService } from '../../services/login.service';
import { ConsoleCaptureService } from '../../services/console-capture.service';
import { MatDialog } from '@angular/material/dialog';
import { ConsoleComponent } from '../console/console.component';
import { LocalStorageComponent } from '../storage/local-storage.component';

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
  mode: Mode = 'desktop';

  constructor(
    private loginService: LoginService,
    public ccs: ConsoleCaptureService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.evaluateMode();
  }

  @HostListener('window:resize')
  onResize() { this.evaluateMode(); }

  evaluateMode() {
    const w = window.innerWidth;
    if (w >= 992) { this.mode = 'desktop' }
    else if (w >= 768) { this.mode = 'tablet' } // icons only
    else { this.mode = 'mobile' }
  }

  onMenuClick() {
    this.toggleMenu.emit();
  }

  onSelectChange(val: string) {
    this.selected = val;
  }

  showLogs() {
    this.dialog.open(ConsoleComponent, { width: '90%', height: '80vh' })
  }

  showStorage() {
    this.dialog.open(LocalStorageComponent, { width: '90%', height: '80vh' })
  }
}
