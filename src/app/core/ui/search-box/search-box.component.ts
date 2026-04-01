import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { UIBaseFormControl } from '../../../directives';
import { IUIDropdownOption } from '../../../interfaces';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'ui-search-box',
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss'
})
export class SearchBoxComponent
  extends UIBaseFormControl<any>
  implements OnInit, OnDestroy {

  @Input() options: IUIDropdownOption[] = [];
  @Input() defaultSelectedValue?: IUIDropdownOption;
  @Output() searchChange = new EventEmitter<string>();

  searchText = '';
  isOpen = false;

  private search$ = new Subject<string>();


  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(300),
        takeUntil(this.isComponentActive)
      )
      .subscribe(value => {
        this.searchChange.emit(value);
        this.isOpen = !!value;
      });
    setTimeout(() => {
      if (this.defaultSelectedValue) {
        this.onSelect(this.defaultSelectedValue);
      }
    }, 100);
  }

  onInput(value: string): void {
    this.searchText = value;
    this.search$.next(value);
    this.updateValue('');
  }

  onSelect(option: IUIDropdownOption): void {
    this.searchText = option.label;
    this.updateValue(option.value);
    this.isOpen = false;
  }

  clear(): void {
    this.searchText = ' ';
    this.isOpen = false;
    this.updateValue('');
    this.searchChange.emit('');
  }

  trackByValue(_: number, option: IUIDropdownOption): any {
    return option.value;
  }

  ngOnDestroy(): void {
    this.search$.complete();
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
