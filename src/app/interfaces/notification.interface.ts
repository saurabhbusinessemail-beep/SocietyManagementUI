import { NotificationTypes } from "../constants";
import { IDefaultFields, ISociety, IUser } from "./";

export interface INotification extends IDefaultFields {
    _id: string;
    userId: string | IUser;
    societyId?: string | ISociety;
    type: 'COMPLAINT' | 'ANNOUNCEMENT' | 'PAYMENT' | 'GATE_PASS' | 'GATE_PASS_RESPONSE' | 'GENERAL';
    title: string,
    message: string;
    data?: any;
    isRead: boolean;
    readAt?: Date;
    triggeredByUserId?: string | IUser;
}