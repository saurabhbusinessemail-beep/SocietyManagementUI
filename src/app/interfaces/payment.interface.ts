import { IDefaultFields } from "./";

export interface IPayment extends IDefaultFields {
    paymentId: string;
    total: number;
    coupon?: string;
    sgst: number;
    cgst: number;
    finalTotal: number;
    payeeGSTNumber?: string;
    receiverGSTNumber?: string;
    paymentMode?: string;
    paymentInfo?: string;
    otherInfo: string;
    selectedFeatureIds?: string[];
}