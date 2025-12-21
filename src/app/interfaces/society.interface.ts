import { IDefaultFields, IUser, UILocationResult } from "./";

export interface ISociety extends IDefaultFields {
    _id: string;
    societyName: string;
    gpsLocation: UILocationResult;
    numberOfBuildings: number;

    adminContacts: string[] | IUser[];

    settings?: any;
    secreataryIds: string[] | IUser[];
}