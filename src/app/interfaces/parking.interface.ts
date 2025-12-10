import { IDefaultFields } from "./";

export interface IParking extends IDefaultFields {
    parkingId: string;
    parkingNumber: string;
    flatId: string;
}