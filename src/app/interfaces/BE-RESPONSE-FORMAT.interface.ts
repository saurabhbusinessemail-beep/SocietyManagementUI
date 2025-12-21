import { IMyProfile } from "./my-profile.interface";

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
    profile: IMyProfile
}