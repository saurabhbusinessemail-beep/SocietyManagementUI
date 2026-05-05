import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap, debounceTime, startWith } from 'rxjs/operators';

import { ChatService } from '../../../services/chat.service';
import { LoginService } from '../../../services/login.service';
import { DialogService } from '../../../services/dialog.service';
import { IChatRoom, IChatMessage, IChatSendMessagePayload, IChatReplyTo } from '../../../interfaces';

@Component({
    selector: 'app-chat-window',
    templateUrl: './chat-window.component.html',
    styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewChecked {

    @ViewChild('messagesContainer') messagesContainer!: ElementRef;
    @ViewChild('messageInput') messageInput!: ElementRef;
    @ViewChild('fileInput') fileInput!: ElementRef;

    roomId!: string;
    room: IChatRoom | null = null;
    messages: IChatMessage[] = [];

    messageControl = new FormControl('');
    isLoading = true;
    isSending = false;
    isLoadingMore = false;
    hasMore = true;
    page = 1;

    currentUserId: string = '';
    replyingTo: IChatReplyTo | null = null;
    activeMessageMenu: string | null = null;
    showAttachMenu = false;
    showRoomInfo = false;
    isBlocked = false;

    // For scroll management
    private shouldScrollToBottom = true;
    private lastMessageCount = 0;

    private destroy$ = new Subject<void>();
    private pollInterval = 60000; // Poll every 1 minute

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private chatService: ChatService,
        private loginService: LoginService,
        private dialogService: DialogService
    ) { }

    ngOnInit(): void {
        const profile = this.loginService.getProfileFromStorage();
        this.currentUserId = profile?.user?._id || '';

        this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
            this.roomId = params['roomId'];
            this.loadRoom();
            this.loadMessages(true);
        });

        // Poll for new messages
        interval(this.pollInterval).pipe(
            startWith(0),
            takeUntil(this.destroy$),
            switchMap(() => this.chatService.getRoomMessages(this.roomId, 1, 50))
        ).subscribe({
            next: (response: any) => {
                if (response.success && response.data) {
                    const newMessages = response.data as IChatMessage[];
                    if (newMessages.length !== this.messages.length) {
                        this.messages = newMessages;
                        this.shouldScrollToBottom = true;
                    }
                }
            },
            error: () => { }
        });
    }

    ngAfterViewChecked(): void {
        if (this.shouldScrollToBottom) {
            this.scrollToBottom();
            this.shouldScrollToBottom = false;
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadRoom(): void {
        this.chatService.getRoomById(this.roomId).subscribe({
            next: (response: any) => {
                if (response.success) {
                    this.room = response.data as IChatRoom;
                    if (this.room) {
                        this.isBlocked = this.room.isBlocked || false;
                    }
                }
            }
        });
    }

    getRoomName(): string {
        if (!this.room) return 'Chat';
        if (this.room.type !== 'personal') {
            return this.room.name || this.chatService.getRoomTypeLabel(this.room.type);
        }

        return this.room.name || 'Personal Chat';
    }

    loadMessages(reset = false): void {
        if (reset) {
            this.page = 1;
            this.messages = [];
            this.hasMore = true;
            this.isLoading = true;
        } else {
            this.isLoadingMore = true;
        }

        this.chatService.getRoomMessages(this.roomId, this.page, 50).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                this.isLoadingMore = false;

                if (response.success && response.data) {
                    const newMsgs = response.data as IChatMessage[];
                    if (reset) {
                        this.messages = newMsgs;
                        this.shouldScrollToBottom = true;
                    } else {
                        this.messages = [...newMsgs, ...this.messages];
                    }
                    this.hasMore = newMsgs.length >= 50;
                    this.lastMessageCount = this.messages.length;

                    // Mark as read
                    this.chatService.markRoomAsRead(this.roomId).subscribe();
                }
            },
            error: () => {
                this.isLoading = false;
                this.isLoadingMore = false;
            }
        });
    }

    loadMore(): void {
        if (!this.hasMore || this.isLoadingMore) return;
        this.page++;
        this.loadMessages(false);
    }

    sendMessage(): void {
        const content = this.messageControl.value?.trim();
        if (!content || this.isSending) return;

        const payload: IChatSendMessagePayload = {
            type: 'text',
            content,
            replyTo: this.replyingTo || undefined
        };

        this.isSending = true;
        this.messageControl.setValue('');
        this.replyingTo = null;

        this.chatService.sendMessage(this.roomId, payload).subscribe({
            next: (response: any) => {
                this.isSending = false;
                if (response.success && response.data) {
                    this.messages = [...this.messages, response.data as IChatMessage];
                    this.shouldScrollToBottom = true;
                }
            },
            error: () => {
                this.isSending = false;
            }
        });
    }

    sendLocation(): void {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const payload: IChatSendMessagePayload = {
                    type: 'location',
                    location: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
                    }
                };
                this.chatService.sendMessage(this.roomId, payload).subscribe({
                    next: (response: any) => {
                        if (response.success && response.data) {
                            this.messages = [...this.messages, response.data as IChatMessage];
                            this.shouldScrollToBottom = true;
                        }
                    }
                });
                this.showAttachMenu = false;
            },
            () => alert('Unable to get your location.')
        );
    }

    sendFile(event: Event, type: 'image' | 'video' | 'document'): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];
        if (!file) return;

        // Read file as base64 for demo purposes
        // In production, upload to Firebase/S3 first
        const reader = new FileReader();
        reader.onload = () => {
            const payload: IChatSendMessagePayload = {
                type,
                content: file.name,
                media: {
                    url: reader.result as string,
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type
                }
            };

            this.chatService.sendMessage(this.roomId, payload).subscribe({
                next: (response: any) => {
                    if (response.success && response.data) {
                        this.messages = [...this.messages, response.data as IChatMessage];
                        this.shouldScrollToBottom = true;
                    }
                }
            });
        };
        reader.readAsDataURL(file);
        this.showAttachMenu = false;
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    replyToMessage(message: IChatMessage): void {
        this.replyingTo = {
            messageId: message._id,
            content: message.content || `[${message.type}]`,
            type: message.type,
            senderName: message.senderName || 'Unknown',
            senderId: message.senderId
        };
        this.activeMessageMenu = null;
        this.messageInput?.nativeElement?.focus();
    }

    cancelReply(): void {
        this.replyingTo = null;
    }

    copyMessage(message: IChatMessage): void {
        if (message.content) {
            navigator.clipboard.writeText(message.content).catch(() => { });
        }
        this.activeMessageMenu = null;
    }

    deleteForMe(message: IChatMessage): void {
        this.chatService.deleteMessageForMe(message._id).subscribe({
            next: () => {
                this.messages = this.messages.filter(m => m._id !== message._id);
            }
        });
        this.activeMessageMenu = null;
    }

    deleteForEveryone(message: IChatMessage): void {
        if (!this.chatService.canDeleteForEveryone(message.sentAt)) {
            alert('You can only delete messages within 15 minutes of sending.');
            return;
        }
        this.chatService.deleteMessageForEveryone(message._id).subscribe({
            next: () => {
                const idx = this.messages.findIndex(m => m._id === message._id);
                if (idx >= 0) {
                    this.messages[idx] = { ...this.messages[idx], isDeletedForEveryone: true, content: 'This message was deleted' };
                }
            }
        });
        this.activeMessageMenu = null;
    }

    toggleBlockUser(): void {
        if (!this.room || this.room.type !== 'personal') return;
        this.chatService.toggleBlockUser(this.roomId).subscribe({
            next: (response: any) => {
                if (response.success) {
                    this.isBlocked = response.data?.isBlocked || false;
                }
            }
        });
    }

    async clearChatForMe(): Promise<void> {
        const confirmed = await this.dialogService.confirmDelete(
            'Clear Chat',
            'Clear all messages for you? This cannot be undone.'
        );
        if (confirmed) {
            this.chatService.clearChatForMe(this.roomId).subscribe({
                next: () => {
                    this.messages = [];
                }
            });
        }
    }

    toggleMessageMenu(messageId: string): void {
        this.activeMessageMenu = this.activeMessageMenu === messageId ? null : messageId;
    }

    isMine(message: IChatMessage): boolean {
        const senderId = typeof message.senderId === 'object' ? message.senderId?._id : message.senderId;
        return senderId === this.currentUserId;
    }

    canDeleteForEveryone(message: IChatMessage): boolean {
        return this.isMine(message) && this.chatService.canDeleteForEveryone(message.sentAt);
    }

    openLocation(message: IChatMessage): void {
        if (message.location) {
            const url = this.chatService.getGoogleMapsUrl(message.location.latitude, message.location.longitude);
            window.open(url, '_blank');
        }
    }

    scrollToBottom(): void {
        try {
            if (this.messagesContainer) {
                this.messagesContainer.nativeElement.scrollTop =
                    this.messagesContainer.nativeElement.scrollHeight;
            }
        } catch { }
    }

    goBack(): void {
        this.router.navigate(['/chat/list']);
    }

    formatTime(date: Date | string | undefined): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    formatDate(date: Date | string | undefined): string {
        if (!date) return '';
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return d.toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' });
    }

    shouldShowDate(messages: IChatMessage[], index: number): boolean {
        if (index === 0) return true;
        const current = new Date(messages[index].sentAt);
        const previous = new Date(messages[index - 1].sentAt);
        return current.toDateString() !== previous.toDateString();
    }

    getReadStatus(message: IChatMessage): string {
        if (!this.isMine(message)) return '';
        const readCount = message.readBy?.length || 0;
        if (readCount > 0) return 'read';
        const deliveredCount = message.deliveredTo?.length || 0;
        if (deliveredCount > 0) return 'delivered';
        return 'sent';
    }

    getFileSize(bytes: number | undefined): string {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    trackByMessage(_: number, msg: IChatMessage): string {
        return msg._id;
    }

    closeMenus(): void {
        this.activeMessageMenu = null;
        this.showAttachMenu = false;
    }
}
