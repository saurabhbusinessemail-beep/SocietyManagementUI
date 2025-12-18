import { IDefaultFields } from "./";

export interface IFlatMember extends IDefaultFields {
    _id: string;
    isSecretary?: boolean;
    userId?: string;
    memberName: string;
    memberContactNumber: string;
}