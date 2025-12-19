import { IDefaultFields } from "./";

export interface IBuilding extends IDefaultFields {
    _id: string;
    societyId: string;
    buildingNumber: string;
    floors: number;
    totalFlats: number;
    secreataryId?: string;
}