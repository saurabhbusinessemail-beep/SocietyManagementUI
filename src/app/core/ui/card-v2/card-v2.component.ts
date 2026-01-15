import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-v2',
  templateUrl: './card-v2.component.html',
  styleUrl: './card-v2.component.scss'
})
export class CardV2Component {

  @Input() title: string = '';
  @Input() status: string = '';
  @Input() hideHeaderInfo = false;
  @Input() hideAction = false;
}
