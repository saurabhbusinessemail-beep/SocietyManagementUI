import { IBEResponseFormat } from "./BE-RESPONSE-FORMAT.interface";
import { IFlat } from "./flat.interface";
import { IFlatMember } from "./flat-members.interface";
import { IUser } from "./user.interface";

export interface ITenantDocument {
    _id: string;
    societyId: string;
    flatId: string | IFlat;
    tenantId: string | IUser;
    flatMemberId: string | IFlatMember;
    documentName: string;
    documentUrl: string;
    documentType: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    approvedBy?: string | IUser;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITenantDocumentStats {
    tenantName: string;
    tenantId: string;
    flatMemberId: string;
    submittedCount: number;
    pendingApprovalCount: number;
    approvedCount: number;
    rejectedCount: number;
}
