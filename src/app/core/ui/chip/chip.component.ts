import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-chip',
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss'
})
export class ChipComponent {
  @Input() value: string = '';
  @Input() crossAction: boolean = false;
  @Output() crossClicked = new EventEmitter<void>();
}
