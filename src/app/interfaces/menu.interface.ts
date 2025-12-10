import { IDefaultFields } from "./";

export interface IMenu extends IDefaultFields {
    menuId: string;
    menuName: string;
    menuDisplayName: string;
    relativePath: string;
    icon: string;
}