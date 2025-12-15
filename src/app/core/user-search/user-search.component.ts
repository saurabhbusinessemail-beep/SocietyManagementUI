import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IUIControlConfig, IUIDropdownOption, IUser } from '../../interfaces';
import { FormControl, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs';
import { UserService } from './user.service';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrl: './user-search.component.scss'
})
export class UserSearchComponent implements OnInit, OnDestroy {

  @Input() required = false;
  @Output() selectionChange = new EventEmitter<IUser>();

  private search$ = new Subject<string>();
  private isComponentActive = new Subject<void>();

  userSearchConfig: IUIControlConfig = {
    id: 'user',
    label: 'User',
    placeholder: 'Search User',
  };
  userSearchControl = new FormControl<string | undefined>(undefined);
  users: IUser[] = [];
  filteredUsers: IUIDropdownOption[] = [];

  constructor(private userService: UserService){}

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

    this.userSearchConfig = userSearchConfig;
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
        
        this.users = users.data.data;
        this.filteredUsers = users.data.data.map(u => {
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
      }
    })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
