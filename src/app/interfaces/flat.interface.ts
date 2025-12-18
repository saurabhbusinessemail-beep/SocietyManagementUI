import { FlatTypes, ResidingTypes } from "../constants";
import { IDefaultFields } from "./";

export interface IFlat extends IDefaultFields {
    _id: string;
    societyId: string;
    buildingId?: string;
    flatType: FlatTypes;
    flatNumber: string;
    residingType: ResidingTypes;
    userId?: string;
}