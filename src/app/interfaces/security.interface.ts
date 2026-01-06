import { IDefaultFields, ISociety, IUser } from "./";

export interface ISecurity extends IDefaultFields {
    _id: string;
    societyId: string | ISociety;
    userId: string | IUser;

    jobStart: Date;
    jobEnd?: Date;
    salaryAmount?: number;

    status: 'active' | 'expired' | 'terminated'
}