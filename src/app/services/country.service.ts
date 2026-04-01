import { Injectable } from '@angular/core';
import { ICountry, ICurrency, IUIDropdownOption } from '../interfaces';
import { countries } from '../constants';
import { LoginService } from './login.service';

@Injectable({
    providedIn: 'root'
})
export class CountryService {

    defaultCountryKey = 'DEFAULT_COUNTRY';

    countries = countries;
    countryCallingOptions: IUIDropdownOption<string>[] = countries.map(c => ({
        label: `${c.callingCode} ${c.countryName} (${c.countryCode})`,
        value: c.callingCode
    } as IUIDropdownOption));
    filteredCountryCallingOptions: IUIDropdownOption[] = this.countryCallingOptions;

    get defaultCountryFromStorage(): ICountry | undefined {
        const data = localStorage.getItem(this.defaultCountryKey);
        return data ? (JSON.parse(data) as ICountry) : undefined;
    }

    get defaultCountryCallingCode(): string {
        return this.defaultCountryFromStorage?.callingCode ?? '+91'
    }

    get storageHasDefaultCountry(): boolean {
        return !!this.defaultCountryFromStorage
    }

    get defaultCountry(): ICountry | undefined {
        return this.countries.find(o => o.callingCode === this.defaultCountryCallingCode);
    }

    get defaultCountry_Option() {
        return this.countryCallingOptions.find(o => o.value === this.defaultCountryCallingCode);
    }

    get defaultCurrency_RUPEE() {
        return {
            currency: this.defaultCountryFromStorage?.currency ?? 'INR',
            currencySymbol: this.defaultCountryFromStorage?.currencySymbol ?? '₹'
        }
    }

    get loggedInUserCountry(): ICountry | undefined {
        if (!this.loginService.loggedInUserValue) return;

        return countries.find(c => this.loginService.loggedInUserValue?.user.phoneNumber.indexOf(c.callingCode) === 0)
    }
    get loggedInUserCountryCallingOption(): IUIDropdownOption | undefined {
        return !this.loggedInUserCountry ? undefined : {
            label: `${this.loggedInUserCountry.callingCode} ${this.loggedInUserCountry.countryName} (${this.loggedInUserCountry.countryCode})`,
            value: this.loggedInUserCountry.callingCode
        }
    }
    get loggedInUserCountryCurrency(): ICurrency | undefined {
        return !this.loggedInUserCountry ? undefined : {
            currency: this.loggedInUserCountry.currency,
            currencySymbol: this.loggedInUserCountry.currencySymbol
        }
    }

    constructor(private loginService: LoginService) { }

    updateDefaultCountryByCallingCode(callingCode: string) {
        const country = this.countries.find(o => o.callingCode === callingCode);;
        if (!country) return;

        localStorage.setItem(this.defaultCountryKey, JSON.stringify(country));
    }
}