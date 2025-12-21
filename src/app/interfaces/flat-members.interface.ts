import { IDefaultFields, IFlat, ISociety, IUser } from "./";

export interface IFlatMember extends IDefaultFields {
    _id: string;
    societyId: string | ISociety;
    flatId: string | IFlat;
    userId?: string | IUser;
    name: string;
    contact: string;
    isOwner: boolean;
    isTenant: boolean;
} 