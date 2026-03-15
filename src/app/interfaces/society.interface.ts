import { IDefaultFields, IUser, UILocationResult } from "./";

export interface ISociety extends IDefaultFields {
    _id: string;
    societyName: string;
    gpsLocation: UILocationResult;
    numberOfBuildings: number;
    
    isApproved: boolean,
    isRejected: boolean,
    addedByAdmin: boolean,

    adminContacts: string[] | IUser[];

    settings?: any;
    managerIds: string[] | IUser[];
}