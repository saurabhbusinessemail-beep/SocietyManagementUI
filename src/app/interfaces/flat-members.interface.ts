import { ResidingTypes } from "../constants";
import { ICurrency, IDefaultFields, IFlat, ISociety, IUser } from "./";

export interface IFlatMember extends IDefaultFields {
    _id: string;
    societyId: string | ISociety;
    flatId: string | IFlat;
    userId?: string | IUser;

    name: string;
    contact: string;

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

export interface IFlatMemberWithResidency extends IFlatMember {
    residingType?: ResidingTypes;
}

export interface IMyFlatResponse extends IFlatMemberWithResidency {
    tenant?: IFlatMemberWithResidency;
    tenants?: IFlatMemberWithResidency[];
    owner?: IFlatMemberWithResidency;
}
