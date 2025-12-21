import { IDefaultFields, IFlat, IUser } from "./";

export interface IFlatMember extends IDefaultFields {
    _id: string;
    flatId: string | IFlat;
    userId?: string | IUser;
    name: string;
    contact: string;
    isOwner: boolean;
    isTenant: boolean;
} 