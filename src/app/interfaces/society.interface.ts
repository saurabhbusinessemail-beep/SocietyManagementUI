import { IDefaultFields, UILocationResult } from "./";

export interface ISociety extends IDefaultFields {
    _id: string;
    societyName: string;
    gpsLocation: UILocationResult;
    numberOfBuildings: number;

    settings?: any;
    buildingIds?: string[];
    flatIds?: string[];
}