import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IExchangeRate, IExchangeRateResponse } from '../interfaces';
import { PricingPlanService } from './pricing-plan.service';
import { CountryService } from './country.service';

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {

    private API_URL = 'https://api.budjet.org/fiat/INR';

    private exchangeRates?: IExchangeRate;

    get isExchangeRateLoaded() {
        return this.exchangeRates ? true : false;
    }

    constructor(
        private http: HttpClient,
        private pricingPlanService: PricingPlanService,
        private countryService: CountryService
    ) {
    }

    async loadExchangeRate() {
        const response: IExchangeRateResponse = await firstValueFrom(this.pricingPlanService.getCurrencyExchangeRates());

        this.exchangeRates = response.conversion_rates;

    }

    getRate(toCurrency: string) {
        return this.exchangeRates?.[toCurrency];
    }

    get currentCurrency(): string {
        return this.countryService.loggedInUserCountryCurrency?.currency ?? 'INR';
    }

    get currentCurrencyRate(): number {
        return this.getRate(this.currentCurrency) ?? 1;
    }

    convertCurrency(
        amount: number,
        toCurrency: string
    ): number {
        try {

            const rate = this.exchangeRates?.[toCurrency];

            if (!rate) {
                // throw new Error('Invalid target currency');
                return amount;
            }

            return amount * rate;

        } catch (error) {
            console.error('Currency conversion error:', error);
            return amount;
        }
    }

    convertToINR(amount: number): number {
        const rate = this.currentCurrencyRate;
        return amount / rate;
    }

    convertFromINR(amount: number): number {
        const rate = this.currentCurrencyRate;
        return amount * rate;
    }
}