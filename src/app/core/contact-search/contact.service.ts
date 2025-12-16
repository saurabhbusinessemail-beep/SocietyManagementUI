import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, from, map, of, switchMap, take } from 'rxjs';
import { PlatformUtil } from '../../utils/platform.util';
import { ContactPayload, Contacts, GetContactsResult } from '@capacitor-community/contacts';

@Injectable({
    providedIn: 'root'
})
export class ContactService {

    private permissionGranted = false;
    private readonly ASSET_PATH = '/assets/samplePhoneContacts/contacts.json';

    constructor(private http: HttpClient) {
        if (PlatformUtil.isLocalhost() || !PlatformUtil.isNativeMobile()) return;
        
        this.ensurePermission().pipe(take(1)).subscribe();
    }

    private ensurePermission(): Observable<boolean> {

        if (this.permissionGranted) {
            return of(true);
        }

        return from(Contacts.requestPermissions()).pipe(
            map(result => {
                this.permissionGranted = result.contacts === 'granted';
                return this.permissionGranted;
            }),
            catchError(err => {
                alert('Permission error');
                return of(false);
            })
        );
    }

    getContacts(): Observable<ContactPayload[]> {

        if (PlatformUtil.isLocalhost()) {
            return this.getContactsFromAsset();
        }

        if (!PlatformUtil.isNativeMobile()) {
            return of([]);
        }

        return this.getContactsFromDevice()
    }

    searchContacts(searchText: string): Observable<ContactPayload[]> {
        return this.getContacts().pipe(
            map(contacts =>
                (!searchText
                    ? contacts
                    : contacts?.filter(c => this.matchesSearch(c, searchText))) ?? []
            )
        );
    }


    private getContactsFromDevice(): Observable<ContactPayload[]> {
        return from(
            Contacts.getContacts({
                projection: {
                    name: true,
                    phones: true,
                    emails: true
                }
            })
        ).pipe(map(c => {
            return c.contacts
        }));
    }


    private getContactsFromAsset(): Observable<ContactPayload[]> {
        return this.http.get<GetContactsResult>(this.ASSET_PATH)
            .pipe(map(c => c.contacts));
    }

    private matchesSearch(
        contact: ContactPayload,
        searchText: string
    ): boolean {

        const q = searchText.toLowerCase();

        const nameMatch =
            contact.name?.display?.toLowerCase().includes(q) ||
            contact.name?.given?.toLowerCase().includes(q) ||
            contact.name?.family?.toLowerCase().includes(q);

        const phoneMatch =
            contact.phones?.some(p =>
                p.number
                    ?.replace(/\s+/g, '')
                    .includes(q)
            );

        const emailMatch =
            contact.emails?.some(e =>
                e.address
                    ?.toLowerCase()
                    .includes(q)
            );

        return !!(nameMatch || phoneMatch || emailMatch);
    }
}
