import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { IExchangeRate, IExchangeRateResponse } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {

    private API_URL = ' https://api.budjet.org/fiat/INR';

    private exchangeRates?: IExchangeRate;

    get isExchangeRateLoaded() {
        return this.exchangeRates ? true : false;
    }

    constructor(private http: HttpClient) {
    }

    async loadExchangeRate() {
        const response: IExchangeRateResponse = await firstValueFrom(
            this.http.get<IExchangeRateResponse>(`${this.API_URL}`)
        );

        this.exchangeRates = response.conversion_rates;

    }

    getRate(toCurrency: string) {
        return this.exchangeRates?.[toCurrency];
    }

    convertCurrency(
        amount: number,
        toCurrency: string
    ): number {
        try {

            const rate = this.exchangeRates?.[toCurrency];

            if (!rate) {
                throw new Error('Invalid target currency');
            }

            return amount * rate;

        } catch (error) {
            console.error('Currency conversion error:', error);
            throw error;
        }
    }
}