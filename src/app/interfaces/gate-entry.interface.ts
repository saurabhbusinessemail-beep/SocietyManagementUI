import { IDefaultFields, IFlat, IUser, IGatePass } from ".";

export interface IGateEntry extends IDefaultFields {
    _id: string;
    gatePassId?: string | IGatePass;
    flatId?: string | IFlat;
    visitorName?: string;
    visitorContact?: string;
    purpose?: string;
    vehicleNumber?: string;
    entryTime: Date;
    exitTime?: Date;
    status: 'requested' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'completed';
    approvedBy?: string | IUser;
    history?: IGateEntryHistory[];
    
    expiryDate?: Date;
}

export interface IGateEntryHistory extends IDefaultFields {
    fromStatus: 'requested' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'completed';
    toStatus: 'requested' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'completed';
    note: string;
}