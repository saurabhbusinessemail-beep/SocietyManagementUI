import { IUser } from "./";

export interface IDefaultFields {
    createdOn: Date;
    craetedByUserId: string | IUser;
    modifiedOn?: Date;
    modifiedByUserId?: IUser;
    isDeleted?: boolean;
}