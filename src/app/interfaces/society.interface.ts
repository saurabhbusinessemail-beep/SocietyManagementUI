import { IDefaultFields } from "./";

export interface ISociety extends IDefaultFields {
    societyId: string;
    societyName: string;
    gpsLocation?: string;
    district: string;
    city: string;
    state: string;
    country: string;
    numberOfBuildings: number;
}