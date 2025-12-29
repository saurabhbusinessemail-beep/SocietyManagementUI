import { VehicleTypes } from "../constants";
import { IBuilding, IDefaultFields, IFlat, ISociety } from "./";

export interface IParking extends IDefaultFields {
    _id: string;
    parkingNumber: string;
    buildingId?: string | IBuilding;
    societyId: string | ISociety;
    flatId?: string | IFlat;
    parkingType: VehicleTypes;
}