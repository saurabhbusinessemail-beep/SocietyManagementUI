import { ResidingTypes } from "../constants";
import { ICurrency, IDefaultFields, IFlat, ISociety, IUser } from "./";

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
    rentCurrency?: ICurrency;
    rentAmount?: number;
    documents: any;
    status: 'active' | 'expired' | 'terminated';
    owner?: IFlatMember;
    tenant?: IFlatMember;
}

export interface IMyFlatResponse extends IFlatMember {
    tenant?: IFlatMember;
    owner?: IFlatMember
}