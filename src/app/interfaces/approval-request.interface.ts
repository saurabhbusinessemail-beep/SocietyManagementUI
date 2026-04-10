import { IUser } from './user.interface'; // adjust path
import { ISociety } from './society.interface';
import { IFlat } from './flat.interface';
import { IPagination } from './PAGINATION.interface';

export interface IApprovalRequestData {
    // Common fields
    societyId: string;
    // For FlatMember
    flatId?: string;
    name?: string;
    contact?: string;
    isOwner?: boolean;
    isTenant?: boolean;
    isMember?: boolean;
    isTenantMember?: boolean;
    leaseStart?: Date;
    leaseEnd?: Date;
    rentAmount?: number;
    // For Security
    jobStart?: Date;
    jobEnd?: Date;
    salaryAmount?: number;
    userId?: string; // security person's userId
    // ... any other dynamic fields
}

export interface IApprovalRequest {
    _id: string;
    requestType: 'FlatMember' | 'Security';
    data: IApprovalRequestData;
    status: 'pending' | 'approved' | 'rejected';
    requestedBy: string | IUser;
    approvedBy?: string | IUser;
    societyId: string | ISociety;
    flatId?: string | IFlat;
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;

    // Denormalized fields (if added via aggregation)
    requesterName?: string;
    requesterContact?: string;
    societyName?: string;
    flatNumber?: string;
    securityPersonName?: string;
    securityPersonContact?: string;
}

export interface IApprovalQueryParams extends IPagination {
    // Common filters
    requestType?: 'FlatMember' | 'Security';
    status?: string,

    // FlatMember specific filters
    flatNumber?: string;
    societyName?: string;
    requesterName?: string;
    requesterContact?: string;

    // Security specific filters
    securityPersonName?: string;
    securityPersonContact?: string;

    // Global search (overrides individual ones if needed)
    search?: string;
}

// For the combined endpoint (separate params for each list)
export interface ICombinedApprovalQueryParams {
    myParams?: IApprovalQueryParams;
    pendingParams?: IApprovalQueryParams;
}