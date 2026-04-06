import { Component, Input, Output, EventEmitter, OnDestroy, OnInit, ElementRef, HostListener, inject } from '@angular/core';
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

    private elementRef = inject(ElementRef);

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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.isOpen) return;
    const target = event.target as HTMLElement;
    // Close only if click is outside the component's root element
    if (!this.elementRef.nativeElement.contains(target)) {
      this.closePopupAndCleanIfNeeded();
    }
  }

  private closePopupAndCleanIfNeeded(): void {
    // Close the popup
    this.isOpen = false;

    // If user typed something but didn't select any option (value is empty)
    if (this.searchText && !this.value) {
      this.searchText = '';
      this.updateValue('');
      this.searchChange.emit('');
    }
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
    this.searchText = '';
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