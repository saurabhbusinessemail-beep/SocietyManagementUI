export interface IPricingFeature {
    key: string;
    name: string;
    value?: string;
    included: boolean;


    currentUsage: number;
    limit: number;
    hasLimit: boolean;
}

export interface IDurationOption {
    value: number;
    unit: 'months' | 'years';
    discount: number;
}

export interface IAllowedDurations {
    months: number[];
    years: number[];
}

export interface IPricingPlan {
    id: string;
    name: string;
    icon: string;
    price: string;
    priceSuffix?: string;
    priceNote?: string;
    period?: string;
    badge?: string;
    colors: {
        primary: string;
        light: string;
        lighter: string;
        border: string;
        text: string;
        button?: string;
        buttonFrom?: string;
        buttonTo?: string;
        buttonHover?: string;
        badgeBg?: string;
        gradientFrom: string;
        gradientTo: string;
    };
    features: IPricingFeature[];
    buttonText: string;
    buttonVariant?: 'popular' | 'best-value' | 'default';
    isPopular?: boolean;
    isBestValue?: boolean;
    featureCount?: string;
    allowedDurations?: IAllowedDurations;
    durationOptions?: IDurationOption[];
}