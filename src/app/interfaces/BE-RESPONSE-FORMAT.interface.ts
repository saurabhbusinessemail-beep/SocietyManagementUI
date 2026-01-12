import { IMyProfile } from "./my-profile.interface";

export interface IBEResponseFormat<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface IOTPVerificationResponse extends IBEResponseFormat {
    token: string;
}

export interface IPagedResponse<T> extends IBEResponseFormat {
    data: T[];
    limit: number;
    page: number;
    total: number;
}

export interface IMyProfileResponse extends IBEResponseFormat {
    profile: IMyProfile
}