import { IDefaultFields } from "./";

export interface IUserRole extends IDefaultFields {
    userRoleId: string;
    userId: string;
    roleId: string;
}