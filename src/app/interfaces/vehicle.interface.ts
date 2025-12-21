import { VehicleTypes } from "../constants";
import { IDefaultFields } from "./";

export interface IVehicle extends IDefaultFields {
     _id: string;
     flatId: string;
     vehicleNumber: string;
     vehicleType: VehicleTypes;
}