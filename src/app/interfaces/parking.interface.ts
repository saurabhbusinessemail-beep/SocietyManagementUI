import { IDefaultFields } from "./";

export interface IParking extends IDefaultFields {
    _id: string;
    parkingNumber: string;
    flatId?: string;
}