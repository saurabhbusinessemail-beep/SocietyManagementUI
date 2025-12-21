import { FlatTypes, ResidingTypes } from "../constants";
import { IBuilding, IDefaultFields, ISociety, IUser } from "./";

export interface IFlat extends IDefaultFields {
    _id: string;
    flatNumber: string;
    buildingId?: string | IBuilding;
    societyId: string | ISociety;
    flatType: FlatTypes;
    floor: number;
    residingType?: ResidingTypes;
}