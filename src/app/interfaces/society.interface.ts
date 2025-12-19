import { IDefaultFields, UILocationResult } from "./";

export interface ISociety extends IDefaultFields {
    _id: string;
    societyName: string;
    gpsLocation: UILocationResult;
    numberOfBuildings: number;

    adminContact?: string;

    settings?: any;
    secreataryIds?: string[];
    buildingIds?: string[];
    flatIds?: string[];
}