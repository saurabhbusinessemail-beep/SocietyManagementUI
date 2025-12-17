export interface UILocationResult {
    address: string;
    lat: number;
    lng: number;
    placeId?: string;
    source: 'search' | 'current';
}
