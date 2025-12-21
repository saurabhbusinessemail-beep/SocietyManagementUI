import { IMenu, ISocietyRole, IUser } from "./";

export interface IMyProfile {
    user: IUser,
    socities: {
        societyId: string;
        societyRoles: ISocietyRole[],
    }[];
    allMenus: IMenu[];
}