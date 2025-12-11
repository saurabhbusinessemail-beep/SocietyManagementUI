import { IDefaultFields } from "./";

export interface IFlatTenant extends IDefaultFields {
    flatTenantId: string;
    userId?: string;
    tenantName: string;
    tenantContactNumber: string;
}