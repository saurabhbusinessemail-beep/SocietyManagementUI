import { IDefaultFields } from "./";

export interface IFlatMember extends IDefaultFields {
    flatMemberId: string;
    userId?: string;
    memberName: string;
    memberContactNumber: string;
}