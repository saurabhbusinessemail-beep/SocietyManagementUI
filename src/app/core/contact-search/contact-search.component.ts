import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IPhoneContactFlat, IUIControlConfig, IUIDropdownOption } from '../../interfaces';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs';
import { ContactService } from './contact.service';

@Component({
  selector: 'app-contact-search',
  templateUrl: './contact-search.component.html',
  styleUrl: './contact-search.component.scss'
})
export class ContactSearchComponent implements OnInit, OnDestroy {

  @Input() required = false;
  @Output() selectionChange = new EventEmitter<IPhoneContactFlat>();

  private search$ = new BehaviorSubject<string>('');
  private isComponentActive = new Subject<void>();

  contactSearchConfig: IUIControlConfig = {
    id: 'contact',
    label: 'Contacts',
    placeholder: 'Search Contacts',
  };
  contactSearchControl = new FormControl<string | undefined>(undefined);
  contacts: IPhoneContactFlat[] = [];
  filteredContacts: IUIDropdownOption[] = [];

  constructor(private contactService: ContactService) { }

  ngOnInit(): void {
    let contactSearchConfig: IUIControlConfig = {
      id: 'contact',
      label: 'Contact',
      placeholder: 'Search Contact',
    };

    if (this.required) {
      contactSearchConfig = {
        ...contactSearchConfig,
        validations: [
          { name: 'required', validator: Validators.required },
        ],
        errorMessages: {
          required: 'User is required'
        }
      }
    }

    this.contactSearchConfig = contactSearchConfig;
    this.subscribeToSearchChange();
    this.subscribeToContactSelection();
  }

  onSearch(searchString: string) {
    this.search$.next(searchString);
  }

  subscribeToSearchChange() {
    this.search$.pipe(
      debounceTime(100),
      distinctUntilChanged(),
      takeUntil(this.isComponentActive),
      filter(txt => txt !== undefined && txt !== ''),
      switchMap(searchString => {
        this.filteredContacts = [];
        this.contacts = [];
        return this.contactService.searchContacts(searchString).pipe(takeUntil(this.isComponentActive))
      })
    )
      .subscribe({
        next: contacts => {

          this.contacts = contacts.reduce((arr, c) => {
            c.phones?.forEach(cp => arr.push({ contactId: c.contactId, name: c.name?.display ?? '', phoneNumber: cp.number || '' }))
            return arr;
          }, [] as IPhoneContactFlat[]);

          // remove duplicates
          const uniqueRecords = new Set(this.contacts.map(c =>
            c.contactId + '___'
            + c.name + '___'
            + c.phoneNumber.replaceAll(' ', '').replaceAll('+', '').replaceAll('-', '')
          ));
          const updatedContacts: IPhoneContactFlat[] = [];
          uniqueRecords.forEach(e => {
            const arr = e.split('___');
            updatedContacts.push({
              contactId: arr[0],
              name: arr[1],
              phoneNumber: arr[2]
            });
          });
          this.contacts = updatedContacts;

          this.filteredContacts = this.contacts
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
            .reduce((arr, u) => {
              if (u.name.toLowerCase().indexOf(this.search$.value.toLowerCase()) < 0) return arr;

              arr.push({
                label: u.name + ' ' + u.phoneNumber,
                value: u.contactId,
              });
              return arr;
            }, [] as IUIDropdownOption[]);
        },
        error: err => {
          alert('Error while getting contacts ' + JSON.stringify(err));
        }
      });
  }

  subscribeToContactSelection() {
    this.contactSearchControl.valueChanges.pipe(takeUntil(this.isComponentActive))
      .subscribe({
        next: selectedContact => {
          const user = this.contacts.find(c => c.contactId === selectedContact);
          if (user) this.selectionChange.emit(user);
        }
      })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
