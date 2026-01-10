import { IDefaultFields } from "./default-fields.interface";
import { IFlat } from "./flat.interface";
import { ISociety } from "./society.interface";
import { IUser } from "./user.interface";

export interface IGatePass extends IDefaultFields {
    _id: string;
    societyId: string | ISociety;
    flatId: string | IFlat;
    isAssignedBySociety?: boolean;
    otp: number;
    expectedDate: Date;
    userId: string | IUser;
    remarks?: string;
}