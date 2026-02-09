// comment.interface.ts
export interface CommentAttachment {
    fileName: string;
    fileUrl: string;
    fileType: string;
    thumbnailUrl?: string;
    fileSize?: number;
    uploadedAt: Date;
}

export interface EditHistory {
    content: string;
    editedAt: Date;
    reason?: string;
}

export interface Like {
    userId: string;
    reactedAt: Date;
    reactionType: 'like' | 'love' | 'helpful' | 'agree' | 'disagree';
}

export interface Report {
    userId: string;
    reason: 'spam' | 'abuse' | 'offensive' | 'off_topic' | 'other';
    description?: string;
    reportedAt: Date;
    status: 'pending' | 'reviewed' | 'dismissed';
}

export interface CommentBase {
    _id: string;
    announcementId: string;
    userId: string;
    content: string;
    parentCommentId?: string;
    isReply: boolean;
    isEdited: boolean;
    editHistory: EditHistory[];
    likes: Like[];
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
    attachments: CommentAttachment[];
    depth: number;
    path: string;
    author?: UserInfo;
    replies?: Comment[];
    hasLiked?: boolean;
}

export interface Comment extends CommentBase {
    replies?: Comment[];
}

export interface UserInfo {
    _id: string;
    name: string;
    email?: string;
    profilePicture?: string;
    role?: string;
}

export interface ToggleLikeRequest {
    commentId: string;
    userId: string;
    reactionType?: 'like' | 'love' | 'helpful' | 'agree' | 'disagree';
}

export interface CreateCommentRequest {
    announcementId: string;
    userId: string;
    content: string;
    parentCommentId?: string;
    attachments?: File[];
    mentions?: string[];
}

export interface UpdateCommentRequest {
    content: string;
    reason?: string;
}

export interface ReportCommentRequest {
    commentId: string;
    userId: string;
    reason: 'spam' | 'abuse' | 'offensive' | 'off_topic' | 'other';
    description?: string;
}

export interface PinCommentRequest {
    commentId: string;
    pinnedBy: string;
    pinnedAt: Date;
}

export interface SoftDeleteCommentRequest {
    commentId: string;
    deletedBy: string;
    reason?: string;
}