import { IDefaultFields, IFlat, IUser } from "./";

export interface IGatePass extends IDefaultFields {
    _id: string;
    gatePassNumber?: string;
    flatId?: string | IFlat;
    visitorName: string;
    visitorContact: string;
    purpose?: string;
    vehicleNumber?: string;
    expectedIn?: Date;
    expectedOut?: Date;
    status: 'requested' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'completed';
    approvedBy?: string | IUser;
    history?: IGatePassHistory[];
    
    expiryDate?: Date;
    OTP?: number;
}

export interface IGatePassHistory extends IDefaultFields {
    fromStatus: string;
    toStatus: string;
    note: string;
}