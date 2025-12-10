import { IDefaultFields } from "./";

export interface IGatePass extends IDefaultFields {
    gatePassId: string;
    gatePassNumber: string;
    isVisitor?: boolean;
    expiryDate?: Date;
    OTP?: number;
    flatId?: string;
    vehicleNumber?: string;
    notificationId?: string;
}