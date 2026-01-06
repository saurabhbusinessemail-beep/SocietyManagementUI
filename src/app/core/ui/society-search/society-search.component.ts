import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, Self } from '@angular/core';
import { FormControl, NgControl, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs';
import { ISociety, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { SocietiesService } from './society.service';
import { UIBaseFormControl } from '../../../directives';

@Component({
  selector: 'ui-society-search',
  templateUrl: './society-search.component.html',
  styleUrl: './society-search.component.scss'
})
export class SocietySearchComponent extends UIBaseFormControl<ISociety | undefined> implements OnInit, OnDestroy {

  @Output() selectionChange = new EventEmitter<ISociety>();

  private search$ = new Subject<string>();

  societiesSearchConfig: IUIControlConfig = {
    id: 'society',
    label: 'Society',
    placeholder: 'Search Society',
  };
  societiesSearchControl = new FormControl<IUIDropdownOption | undefined>(undefined);
  societies: ISociety[] = [];
  filteredSocieties: IUIDropdownOption[] = [];

  constructor(private societiesService: SocietiesService, @Optional() @Self() ngControl: NgControl) {
    super(ngControl);
  }

  ngOnInit(): void {
    let userSearchConfig: IUIControlConfig = {
      id: 'society',
      label: 'Society',
      placeholder: 'Search Society',
    };

    if (this.required) {
      userSearchConfig = {
        ...userSearchConfig,
        validations: [
          { name: 'required', validator: Validators.required },
        ],
        errorMessages: {
          required: 'User is required'
        }
      }
    }

    this.societiesSearchConfig = this.config ?? userSearchConfig;
    this.subscribeToSearchChange();
    this.subscribeToUserSelection();
  }

  onUserSearch(searchString: string) {
    this.search$.next(searchString);
  }

  subscribeToSearchChange() {
    this.search$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      takeUntil(this.isComponentActive),
      filter(txt => !!txt),
      switchMap(searchString => {
        this.filteredSocieties = [];
        this.societies = [];
        return this.societiesService.searchSocieties(searchString).pipe(takeUntil(this.isComponentActive))
      })
    )
      .subscribe({
        next: users => {
          if (!users.success) return;

          this.societies = users.data;
          this.filteredSocieties = users.data.map(s => {
            return {
              label: s.societyName,
              value: s._id,
            }
          });
        }
      });
  }

  subscribeToUserSelection() {
    this.societiesSearchControl.valueChanges.pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: selectedSociety => {
          const user = this.societies.find(u => u._id === selectedSociety?.value);
          if (user) this.selectionChange.emit(user);
          this.updateValue(user);
        }
      })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
