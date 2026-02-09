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
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'general' | 'maintenance' | 'event' | 'security' | 'billing' | 'other';
    societyId: string | ISociety;
    attachments: IAttachment[];
    isPublished: boolean;
    publishDate: Date;
    expiryDate?: Date;
    views: IView[];
    viewCount: number;
    isPinned: boolean;
    tags: string[];
    status: 'draft' | 'published' | 'archived';
    commentsEnabled: boolean;
    commentCount: number;
    comments?: Comment[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IAnnouncementFilters {
    category?: string;
    priority?: string;
    status?: string;
    isPublished?: boolean;
    isPinned?: boolean;
}