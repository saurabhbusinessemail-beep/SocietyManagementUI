import { IDefaultFields } from "./";

export interface IMenu extends IDefaultFields {
    _id: string;
    menuId: string;
    menuName: string;
    icon?: string;
    mandatorFeatureAccess?: string;
    onlyForSuperAdmin?: boolean;
    relativePath?: string;
    sortOrder?: number;
}