import { IDefaultFields } from "./";

export interface IMenu extends IDefaultFields {
    menuId: string;
    menuName: string;
    icon?: string;
    relativePath?: string; // optional (only top menu items)
    submenus: SubMenu[];
}

export interface SubMenu extends IDefaultFields {
    submenuId: string;
    submenuName: string;
    relativePath: string;
    permissions: string[];  // MUST match existing permission keys
}