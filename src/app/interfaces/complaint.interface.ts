import { ComplaintTypes } from "../constants";
import { IDefaultFields } from "./";

export interface IComplaint extends IDefaultFields {
    _id: string;
    message: string;
    complaintType: ComplaintTypes;
    flatId?: string;
}

export interface IComplaintStats {
    pending: number;
    completed: number;
}