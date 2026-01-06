import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UIBaseFormControl } from '../../../directives';
import { IUIDropdownOption } from '../../../interfaces';

@Component({
  selector: 'ui-select2',
  templateUrl: './select2.component.html',
  styleUrl: './select2.component.scss'
})
export class Select2Component
  extends UIBaseFormControl<any>
  implements OnInit, OnDestroy {

  @Input() options: IUIDropdownOption[] = [];
  @Output() searchChange = new EventEmitter<string>();

  ngOnInit(): void {

  }

  onSearch(event: {
    term: string;
    items: any[];
  }) {
    this.searchChange.emit(event.term);
  }

  onInput(event: any): void {
    this.updateValue(event);
  }

  ngOnDestroy(): void {

  }
}
