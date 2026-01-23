import { ResidingTypes } from "../constants";
import { IDefaultFields, IFlat, ISociety, IUser } from "./";

export interface IFlatMember extends IDefaultFields {
    _id: string;
    societyId: string | ISociety;
    flatId: string | IFlat;
    userId?: string | IUser;

    name: string;
    contact: string;
    residingType?: ResidingTypes;

    isOwner: boolean;
    isTenant: boolean;
    isMember: boolean;
    isTenantMember: boolean;

    leaseStart?: Date;
    leaseEnd?: Date;
    rentAmount?: number;
    documents: any;
    status: 'active' | 'expired' | 'terminated'
}