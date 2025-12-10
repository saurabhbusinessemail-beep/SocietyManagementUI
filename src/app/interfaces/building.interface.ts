import { IDefaultFields } from "./";

export interface IBuilding extends IDefaultFields {
    buildingId: string;
    societyId: string;
    buildingNumber: string;
}