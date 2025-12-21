import { FlatTypes } from "../constants";
import { IDefaultFields, IFlat, ISociety } from "./";

export interface IParking extends IDefaultFields {
    _id: string;
    parkingNumber: string;
    societyId: string | ISociety;
    flatId?: string | IFlat;
    type: FlatTypes;
}