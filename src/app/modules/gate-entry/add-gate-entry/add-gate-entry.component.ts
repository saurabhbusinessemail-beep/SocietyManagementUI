import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IUIDropdownOption } from '../../../interfaces';

@Component({
  selector: 'app-add-gate-entry',
  templateUrl: './add-gate-entry.component.html',
  styleUrl: './add-gate-entry.component.scss'
})
export class AddGateEntryComponent {

  fb = new FormGroup({
    gatePassId: new FormControl<string | undefined>(undefined),
    flat: new FormControl<IUIDropdownOption | undefined>(undefined),
    visitorName: new FormControl<string | undefined>(undefined),
    visitorContact: new FormControl<string | undefined>(undefined),
    purpose: new FormControl<string | undefined>(undefined),
    vehicleNumber: new FormControl<string | undefined>(undefined),
    entryTime: new FormControl<Date | undefined>(undefined),
  });

  
}
