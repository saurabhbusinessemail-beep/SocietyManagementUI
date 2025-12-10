import { VehicleTypes } from "../constants";
import { IDefaultFields } from "./";

export interface IVehicle extends IDefaultFields {
     vehicleId: string;
     vehicleNumber: string;
     vehicleType: VehicleTypes;
     flatId: string;
}