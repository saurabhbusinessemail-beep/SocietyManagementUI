import { IMenu } from "./menu.interface";
import { IUser } from "./user.interface";

export interface IBEResponseFormat {
    success: boolean;
    message?: string;
}

export interface IOTPVerificationResponse extends IBEResponseFormat {
    token: string;
}

export interface IPagedResponse<T> extends IBEResponseFormat {
    data: {
        data: T[];
        limit: number;
        page: number;
        total: number;
    };
}

export interface IMyProfileResponse extends IBEResponseFormat {
    menus: IMenu[];
    permissions: any[];
    user: IUser;
}