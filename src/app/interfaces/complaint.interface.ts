import { ComplaintTypes } from "../constants";
import { IDefaultFields } from "./";

export interface IComplaint extends IDefaultFields {
    complaintId: string;
    message: string;
    complaintType: ComplaintTypes;
    flatId?: string;
}