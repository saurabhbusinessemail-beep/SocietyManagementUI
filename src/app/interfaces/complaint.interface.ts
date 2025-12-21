import { ComplaintTypes } from "../constants";
import { IDefaultFields, IFlat, ISociety, IUser } from "./";

export interface IComplaint extends IDefaultFields {
    _id: string;
    flatId: string | IFlat;
    societyId: string | ISociety;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    complaintType: ComplaintTypes;
    status: 'open'| 'in_progress'| 'resolved'| 'closed'| 'rejected',
    assignedTo: string | IUser;
}

export interface IComplaintStats {
    pending: number;
    completed: number;
}