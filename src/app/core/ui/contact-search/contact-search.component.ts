import { Component, EventEmitter, OnDestroy, OnInit, Optional, Output, Self } from '@angular/core';
import { FormControl, NgControl, Validators } from '@angular/forms';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs';
import { ContactService } from './contact.service';
import { IPhoneContactFlat, IUIControlConfig, IUIDropdownOption } from '../../../interfaces';
import { UIBaseFormControl } from '../../../directives';


@Component({
  selector: 'ui-contact-search',
  templateUrl: './contact-search.component.html',
  styleUrl: './contact-search.component.scss'
})
export class ContactSearchComponent extends UIBaseFormControl<IPhoneContactFlat | undefined> implements OnInit, OnDestroy {

  @Output() selectionChange = new EventEmitter<IPhoneContactFlat>();

  private search$ = new BehaviorSubject<string>('');

  contactSearchConfig: IUIControlConfig = {
    id: 'contact',
    label: 'Contacts',
    placeholder: 'Search Contacts',
  };
  contactSearchControl = new FormControl<string | undefined>(undefined);
  contacts: IPhoneContactFlat[] = [];
  filteredContacts: IUIDropdownOption[] = [];

  constructor(private contactService: ContactService, @Optional() @Self() ngControl: NgControl) {
    super(ngControl);
  }

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

    this.contactSearchConfig = this.config ?? contactSearchConfig;
    this.subscribeToSearchChange();
    this.subscribeToContactSelection();
  }

  normalizeIndianPhone(phone: string): string {
    if (!phone || typeof phone !== 'string') return phone;

    // Remove all non-digit characters, but keep a leading '+' if present
    let cleaned = phone.trim();
    const hasPlus = cleaned.startsWith('+');
    const digits = cleaned.replace(/\D/g, '');

    // Only process if we have at least 10 digits (Indian mobile numbers)
    if (digits.length < 10) return phone;

    let normalized = null;

    if (digits.length === 10) {
      // Exactly 10 digits: add +91
      normalized = `+91${digits}`;
    } else if (digits.length === 11 && digits.startsWith('0')) {
      // 11 digits starting with 0: replace 0 with +91
      normalized = `+91${digits.slice(1)}`;
    } else if (digits.length === 12 && digits.startsWith('91')) {
      // 12 digits starting with 91: replace 91 with +91
      normalized = `+91${digits.slice(2)}`;
    } else if (hasPlus && digits.length === 12 && digits.startsWith('91')) {
      // Already has +, but maybe it's +91XXXXXXXXXX – keep as is
      normalized = phone;
    }

    // If we produced a new version, return it; otherwise keep original
    return normalized || phone;
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
          console.log('contacts = ', contacts)

          this.contacts = contacts.reduce((arr, c) => {
            c.phones?.forEach(cp => arr.push({ contactId: c.contactId, name: c.name?.display ?? '', phoneNumber: cp.number || '' }))
            return arr;
          }, [] as IPhoneContactFlat[]);

          // remove duplicates
          const uniqueRecords = new Set(this.contacts.map(c =>
            c.contactId + '___'
            + c.name + '___'
            + this.normalizeIndianPhone(c.phoneNumber) //.replaceAll(' ', '').replaceAll('+', '').replaceAll('-', '').slice(-10)
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
          this.updateValue(user);
        }
      })
  }

  ngOnDestroy(): void {
    this.isComponentActive.next();
    this.isComponentActive.complete();
  }
}
