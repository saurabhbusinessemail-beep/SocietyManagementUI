import { NotificationTypes } from "../constants";
import { IDefaultFields, IUser } from "./";

export interface INotification extends IDefaultFields {
    _id: string;
    toUserId?: string | IUser;
    toUserIds?: string[] | IUser[];
    notificationType: NotificationTypes;
    title: string;
    body: string;
    isRead: boolean;
    payload: string;
    channel: 'inapp' | 'email' | 'sms' | 'push'
}