import { IDefaultFields, ISociety } from "./";

export interface IBuilding extends IDefaultFields {
    _id: string;
    buildingNumber: string;
    societyId: string | ISociety;
    floors: number;
}