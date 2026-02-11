import { AnnouncementCategoryType, AnnouncementPriorityType, AnnouncementStatusType } from "../types";
import { IDefaultFields } from "./default-fields.interface";
import { ISociety } from "./society.interface";
import { IUser } from "./user.interface";

// announcement.interface.ts
export interface IAttachment {
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: Date;
}

export interface IView {
    userId: string | IUser;
    viewedAt: Date;
}

export interface IAnnouncement extends IDefaultFields {
    _id: string;
    title: string;
    content: string;
    priority: AnnouncementPriorityType;
    category: AnnouncementCategoryType;
    societyId: string | ISociety;
    attachments: IAttachment[];
    isPublished: boolean;
    publishDate: Date;
    expiryDate?: Date;
    views: IView[];
    viewCount: number;
    isPinned: boolean;
    tags: string[];
    status: AnnouncementStatusType;
    commentsEnabled: boolean;
    commentCount: number;
    comments?: Comment[];
}

export interface IAnnouncementFilters {
    societyId: string;
    category?: AnnouncementCategoryType;
    priority?: AnnouncementPriorityType;
    status?: AnnouncementStatusType;
    isPublished?: boolean;
    isPinned?: boolean;
}