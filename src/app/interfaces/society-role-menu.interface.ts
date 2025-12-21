import { ISocietyRole } from "./";


export interface ISocietyRoleMenu {
    _id: string;
    role: string | ISocietyRole;
    menus: { menuId: string | ISocietyRoleMenu, sortOrder: number };
}