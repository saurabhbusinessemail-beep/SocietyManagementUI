import { FlatTypes } from "../constants";
import { IBuilding, IDefaultFields, ISociety, IUser } from "./";
import { IFlatMember } from "./flat-members.interface";

export interface IFlat extends IDefaultFields {
    _id: string;
    flatNumber: string;
    buildingId?: string | IBuilding;
    societyId: string | ISociety;
    flatType: FlatTypes;
    floor: number;
}