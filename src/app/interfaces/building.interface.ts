import { IDefaultFields, ISociety, IUser } from "./";

export interface IBuilding extends IDefaultFields {
    _id: string;
    buildingNumber: string;
    societyId: string | ISociety;
    floors: number;
    managerId?: string | IUser;
}
