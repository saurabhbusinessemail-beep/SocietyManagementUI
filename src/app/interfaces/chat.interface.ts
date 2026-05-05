export type ChatRoomType = 'society' | 'building' | 'flat_all' | 'flat_owner_tenant' | 'society_all' | 'personal';
export type ChatMessageType = 'text' | 'image' | 'video' | 'document' | 'location' | 'audio';

export interface IChatParticipant {
    userId: string;
    joinedAt?: Date | string;
    isBlocked?: boolean;
    blockedAt?: Date | string;
    lastReadAt?: Date | string;
    lastReadMessageId?: string;
}

export interface IChatLastMessage {
    messageId?: string;
    content?: string;
    type?: ChatMessageType;
    sentAt?: Date | string;
    sentByUserId?: string | any;
    senderName?: string;
}

export interface IChatRoom {
    _id: string;
    type: ChatRoomType;
    name: string;
    description?: string;
    societyId: string | any;
    buildingId?: string | any;
    flatId?: string | any;
    participants?: IChatParticipant[];
    lastMessage?: IChatLastMessage;
    messageCount?: number;
    isActive?: boolean;
    avatar?: string;
    unreadCount?: number;
    isBlocked?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface IChatMedia {
    url: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    thumbnail?: string;
    duration?: number;
}

export interface IChatLocation {
    latitude: number;
    longitude: number;
    address?: string;
    placeName?: string;
}

export interface IChatReplyTo {
    messageId: string;
    content?: string;
    type?: ChatMessageType;
    senderName?: string;
    senderId?: string | any;
}

export interface IChatMessageReadBy {
    userId: string | any;
    readAt: Date | string;
}

export interface IChatMessageDeliveredTo {
    userId: string | any;
    deliveredAt: Date | string;
}

export interface IChatMessage {
    _id: string;
    roomId: string | any;
    societyId: string;
    senderId: string | any;
    senderName?: string;
    senderSubtitle?: string;
    type: ChatMessageType;
    content?: string;
    media?: IChatMedia;
    location?: IChatLocation;
    replyTo?: IChatReplyTo;
    deliveredTo?: IChatMessageDeliveredTo[];
    readBy?: IChatMessageReadBy[];
    isDeletedForEveryone?: boolean;
    deletedForEveryone?: { deletedAt: Date | string; deletedByUserId: string };
    deletedForUsers?: string[];
    isDeleted?: boolean;
    isEdited?: boolean;
    editedAt?: Date | string;
    sentAt: Date | string;
    createdAt?: Date | string;
}

export interface IChatSearchResult {
    rooms: IChatRoom[];
    messages: IChatMessage[];
    total: number;
}

export interface IChatSendMessagePayload {
    type: ChatMessageType;
    content?: string;
    media?: IChatMedia;
    location?: IChatLocation;
    replyTo?: IChatReplyTo;
}
