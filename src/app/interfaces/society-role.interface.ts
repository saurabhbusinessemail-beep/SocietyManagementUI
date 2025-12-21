import { IDefaultFields } from "./";

export interface ISocietyRole extends IDefaultFields {
    _id: string;
    name: string;
    displayName: string;
    description: string;
    permissions: string[];
}