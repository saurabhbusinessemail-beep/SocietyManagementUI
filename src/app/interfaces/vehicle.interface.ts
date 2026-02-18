import { VehicleTypes } from "../constants";
import { IDefaultFields, IFlat } from "./";

export interface IVehicle extends IDefaultFields {
     _id: string;
     flatId: string | IFlat;
     vehicleNumber: string;
     vehicleType: VehicleTypes;
}