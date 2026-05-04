// formatted-price.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { countries } from '../constants';
import { CountryService } from '../services/country.service';
import { ICurrency } from '../interfaces';
import { CurrencyService } from '../services/currency.service';


@Pipe({
    name: 'formattedPrice',
    pure: true,
})
export class FormattedPricePipe implements PipeTransform {

    constructor(private countryService: CountryService, private currencyService: CurrencyService) { }

    transform(amount: number | undefined | null): string {
        if (amount === undefined || amount === null) return '';

        let toCurrency: ICurrency | undefined = !this.countryService.loggedInUserCountry ? undefined : {
            currency: this.countryService.loggedInUserCountry.currency,
            currencySymbol: this.countryService.loggedInUserCountry.currencySymbol
        }
        const defaultCurrency = this.countryService.defaultCurrency_RUPEE;

        // Convert currency if requested and different from INR
        let targetAmount = amount;
        if (toCurrency && toCurrency.currency !== 'INR') {
            const rate = this.currencyService.getRate(toCurrency.currency);
            if (rate === undefined) {
                console.warn(`Unsupported currency: ${toCurrency}. Falling back to INR.`);
                targetAmount = amount;
                toCurrency = defaultCurrency
            } else {
                targetAmount = amount * rate;
            }
        }

        // Apply Math.ceil and format with Indian locale
        const formattedNumber = (+targetAmount.toFixed(2)).toLocaleString('en-IN');

        // Determine the correct currency symbol
        const currencySymbol = (toCurrency ?? defaultCurrency).currencySymbol;

        // 4. Return the final string
        return `${currencySymbol}${formattedNumber}`;
    }
}