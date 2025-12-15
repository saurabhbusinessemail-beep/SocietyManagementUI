import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlatformUtil } from '../../utils/platform.util';
import { ContactPayload, Contacts, GetContactsResult } from '@capacitor-community/contacts';

@Injectable({
    providedIn: 'root'
})
export class ContactService {

    private readonly ASSET_PATH = '/assets/samplePhoneContacts/contacts.json';

    constructor(private http: HttpClient) { }

    // searchUsers(searchString: string): Observable<ContactPayload[]> {
    //     return this.http.get<ContactPayload[]>(`/assets/samplePhoneContacts/contacts.json`);
    // }

    /* ---------------------------------------------
   * PUBLIC API
   * ------------------------------------------- */

    getContacts(): Observable<ContactPayload[]> {

        // ✅ DEV ONLY (localhost)
        if (PlatformUtil.isLocalhost()) {
            return this.getContactsFromAsset();
        }

        // ❌ deployed web / tablet
        if (!PlatformUtil.isNativeMobile()) {
            return of([]);
            // throw new Error('');
        }

        // ✅ native mobile app
        return this.ensurePermission$().pipe(
            switchMap(allowed =>
                allowed
                    ? this.getContactsFromDevice()
                    : of([])
            )
        );
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

    /* ---------------------------------------------
     * PERMISSIONS
     * ------------------------------------------- */

    private ensurePermission$(): Observable<boolean> {
        return from(Contacts.checkPermissions()).pipe(
            switchMap(status => {

                if (status.contacts === 'granted') {
                    return of(true);
                }

                if (status.contacts === 'denied') {
                    return of(false); // ❌ never ask again
                }

                return from(Contacts.requestPermissions()).pipe(
                    map(result => result.contacts === 'granted')
                );
            })
        );
    }

    /* ---------------------------------------------
     * DEVICE CONTACTS
     * ------------------------------------------- */

    private getContactsFromDevice(): Observable<ContactPayload[]> {
        return from(
            Contacts.getContacts({
                projection: {
                    name: true,
                    phones: true,
                    emails: true
                }
            })
        ).pipe(map(c => c.contacts));
    }

    /* ---------------------------------------------
     * ASSET CONTACTS (DEV ONLY)
     * ------------------------------------------- */

    private getContactsFromAsset(): Observable<ContactPayload[]> {
        return this.http.get<GetContactsResult>(this.ASSET_PATH)
            .pipe(map(c => c.contacts));
    }

    /* ---------------------------------------------
     * SEARCH HELPERS
     * ------------------------------------------- */

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
