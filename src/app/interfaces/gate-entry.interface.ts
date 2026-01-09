import { IDefaultFields, IFlat, IUser } from ".";

export interface IGateEntry extends IDefaultFields {
    _id: string;
    gatePassNumber?: string;
    flatId?: string | IFlat;
    visitorName: string;
    visitorContact: string;
    purpose?: string;
    vehicleNumber?: string;
    entryTime: Date;
    exitTime?: Date;
    expectedIn?: Date;
    expectedOut?: Date;
    status: 'requested' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'completed';
    approvedBy?: string | IUser;
    history?: IGateEntryHistory[];
    
    expiryDate?: Date;
    OTP?: number;
}

export interface IGateEntryHistory extends IDefaultFields {
    fromStatus: string;
    toStatus: string;
    note: string;
}