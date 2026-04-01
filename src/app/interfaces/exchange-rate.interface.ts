export interface IExchangeRate {
    [key: string]: number;
}

export interface IExchangeRateResponse {
    result: string;
    base_code: string;
    conversion_rates: IExchangeRate
}