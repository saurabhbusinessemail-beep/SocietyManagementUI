import { IGateEntry } from './gate-entry.interface';
import { ISociety } from './society.interface';
import { IApprovalRequest } from './approval-request.interface';
import { IRentPayment } from './rent.interface';
import { IMaintenancePayment } from './maintenance.interface';
import { ITenantDocument } from './tenant-document.interface';

export interface IDashboardApprovals {
    gateEntries?: IGateEntry[];
    societies?: ISociety[];
    joinRequests?: IApprovalRequest[];
    rentPayments?: IRentPayment[];
    maintenancePayments?: IMaintenancePayment[];
    tenantDocuments?: ITenantDocument[];
}
