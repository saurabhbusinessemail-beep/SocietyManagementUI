import { ApprovalTypes, NotificationTypes } from "../constants";
import { IDefaultFields } from "./";

export interface INotification extends IDefaultFields {
    notificationId: string;
    notificationType: NotificationTypes;
    message: string;
    flatId?: string;
    buildingId?: string;
    societyId?: string;
    approvalStatus?: ApprovalTypes
}