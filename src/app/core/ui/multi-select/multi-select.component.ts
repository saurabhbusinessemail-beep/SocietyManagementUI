import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss'
})
export class MultiSelectComponent {

  @Input() selectMode = false;
  @Input() selectedIds = new Set<string>();
  
  @Input() showDelete = false;
  @Output() delete = new EventEmitter<void>();

  @Output() changeSelectionMode = new EventEmitter<boolean>();

  get isDeleteVisible(): boolean {
    return this.showDelete && this.selectMode && this.selectedIds.size > 0
  }

}
