import { FlatTypes, ResidingTypes } from "../constants";
import { IDefaultFields } from "./";

export interface IFlat extends IDefaultFields {
    _id: string;
    flatNumber: string;
    buildingId?: string;
    societyId: string;
    flatType: FlatTypes;
    floor: number;
    residingType?: ResidingTypes;
    ownerId?: string;
    memberIds?: string[];
    tenantId?: string;

    parkingIds: string[];
}