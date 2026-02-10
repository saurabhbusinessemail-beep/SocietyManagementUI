// comment.interface.ts
export interface ICommentAttachment {
    fileName: string;
    fileUrl: string;
    fileType: string;
    thumbnailUrl?: string;
    fileSize?: number;
    uploadedAt: Date;
}

export interface IEditHistory {
    content: string;
    editedAt: Date;
    reason?: string;
}

export interface ILike {
    userId: string;
    reactedAt: Date;
    reactionType: 'like' | 'love' | 'helpful' | 'agree' | 'disagree';
}

export interface IReport {
    userId: string;
    reason: 'spam' | 'abuse' | 'offensive' | 'off_topic' | 'other';
    description?: string;
    reportedAt: Date;
    status: 'pending' | 'reviewed' | 'dismissed';
}

export interface ICommentBase {
    _id: string;
    announcementId: string;
    userId: string;
    content: string;
    parentCommentId?: string;
    isReply: boolean;
    isEdited: boolean;
    editHistory: IEditHistory[];
    likes: ILike[];
    likeCount: number;
    reports: Report[];
    reportCount: number;
    isHidden: boolean;
    hiddenBy?: string;
    hiddenAt?: Date;
    hiddenReason?: string;
    isDeleted: boolean;
    deletedAt?: Date;
    deletedBy?: string;
    isPinned: boolean;
    pinnedBy?: string;
    pinnedAt?: Date;
    engagementScore: number;
    userAgent?: string;
    ipAddress?: string;
    mentions: string[];
    attachments: ICommentAttachment[];
    depth: number;
    path: string;
    author?: IUserInfo;
    replies?: Comment[];
    hasLiked?: boolean;
}

export interface Comment extends ICommentBase {
    replies?: Comment[];
}

export interface IUserInfo {
    _id: string;
    name: string;
    email?: string;
    profilePicture?: string;
    role?: string;
}

export interface IToggleLikeRequest {
    commentId: string;
    userId: string;
    reactionType?: 'like' | 'love' | 'helpful' | 'agree' | 'disagree';
}

export interface ICreateCommentRequest {
    announcementId: string;
    userId: string;
    content: string;
    parentCommentId?: string;
    attachments?: File[];
    mentions?: string[];
}

export interface IUpdateCommentRequest {
    content: string;
    reason?: string;
}

export interface IReportCommentRequest {
    commentId: string;
    userId: string;
    reason: 'spam' | 'abuse' | 'offensive' | 'off_topic' | 'other';
    description?: string;
}

export interface IPinCommentRequest {
    commentId: string;
    pinnedBy: string;
    pinnedAt: Date;
}

export interface ISoftDeleteCommentRequest {
    commentId: string;
    deletedBy: string;
    reason?: string;
}