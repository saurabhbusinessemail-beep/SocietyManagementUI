import { IDefaultFields } from "./";

export interface IMenu extends IDefaultFields {
    _id: string;
    menuId: string;
    menuName: string;
    icon?: string;
    relativePath?: string;
    sortOrder?: number;
}