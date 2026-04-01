import { Injectable } from "@angular/core";
import { Resolve } from "@angular/router";
import { Observable } from "rxjs";
import { CurrencyService } from "../services/currency.service";

@Injectable({ providedIn: 'root' })
export class ExchangeRateResolver implements Resolve<any> {
    constructor(private currencyService: CurrencyService) { }

    async resolve() {
        if (this.currencyService.isExchangeRateLoaded) return;

        return await this.currencyService.loadExchangeRate();
    }
}