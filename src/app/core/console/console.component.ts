import { Component } from '@angular/core';
import { ConsoleCaptureService } from '../../services/console-capture.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrl: './console.component.scss'
})
export class ConsoleComponent {

  constructor(
    public ccs: ConsoleCaptureService,
    private dialogRef: MatDialogRef<ConsoleComponent>
    ) { }

  clear() {
    this.ccs.clear();
  }

  close() {
    this.dialogRef.close();
  }
}
