import { IUser } from "./";

export interface IDefaultFields {
    createdOn: Date;
    createdByUserId: string | IUser;
    modifiedOn?: Date;
    modifiedByUserId?: IUser;
    isDeleted?: boolean;
}