import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'ui-loading',
  templateUrl: './loading-data.component.html',
  styleUrl: './loading-data.component.scss'
})
export class LoadingDataComponent {
  @Input() message: string = '';
  @Input() onlyMessage = false;
}
