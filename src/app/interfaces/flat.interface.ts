import { FlatTypes, ResidingTypes } from "../constants";
import { IDefaultFields } from "./";

export interface IFlat extends IDefaultFields {
    flatId: string;
    societyId: string;
    buildingId?: string;
    flatType: FlatTypes;
    flatNumber: string;
    residingType: ResidingTypes;
    userId?: string;
}