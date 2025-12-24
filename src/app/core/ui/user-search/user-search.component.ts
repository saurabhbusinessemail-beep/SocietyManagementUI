import { Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output, Self } from '@angular/core';
import { FormControl, NgControl, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs';
import { IUIControlConfig, IUIDropdownOption, IUser } from '../../../interfaces';
import { UserService } from './user.service';
import { UIBaseFormControl } from '../../../directives';

@Component({
  selector: 'ui-user-search',
  templateUrl: './user-search.component.html',
  styleUrl: './user-search.component.scss'
})
export class UserSearchComponent extends UIBaseFormControl<IUser | undefined> implements OnInit, OnDestroy {

  @Output() selectionChange = new EventEmitter<IUser>();

  private search$ = new Subject<string>();

  userSearchConfig: IUIControlConfig = {
    id: 'user',
    label: 'User',
    placeholder: 'Search User',
  };
  userSearchControl = new FormControl<string | undefined>(undefined);
  users: IUser[] = [];
  filteredUsers: IUIDropdownOption[] = [];

  constructor(private userService: UserService, @Optional() @Self() ngControl: NgControl){
    super(ngControl);
  }

  ngOnInit(): void {
    let userSearchConfig: IUIControlConfig = {
      id: 'user',
      label: 'User',
      placeholder: 'Search User',
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

    this.userSearchConfig = this.config ?? userSearchConfig;
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
        this.filteredUsers = [];
        this.users = [];
        return this.userService.searchUsers(searchString).pipe(takeUntil(this.isComponentActive))
      })
    )
    .subscribe({
      next: users => {
        if (!users.success) return;
        
        this.users = users.data;
        this.filteredUsers = users.data.map(u => {
          return {
            label: (u.name ?? 'No Name') + ' - ' + u.phoneNumber,
            value: u._id,
          }
        });
      }
    });
  }

  subscribeToUserSelection() {
    this.userSearchControl.valueChanges.pipe(takeUntil(this.isComponentActive))
    .subscribe({
      next: selectedUser => {
        const user = this.users.find(u => u._id === selectedUser);
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
