import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap, startWith } from 'rxjs/operators';

import { ChatService } from '../../../services/chat.service';
import { SocietyService } from '../../../services/society.service';
import { LoginService } from '../../../services/login.service';
import { IChatRoom, IChatMessage } from '../../../interfaces';

interface GroupedRooms {
    societyId: string;
    societyName: string;
    rooms: IChatRoom[];
}

@Component({
    selector: 'app-chat-list',
    templateUrl: './chat-list.component.html',
    styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnInit, OnDestroy {

    activeTab: 'society' | 'personal' = 'society';
    groupedRooms: GroupedRooms[] = [];
    personalRooms: IChatRoom[] = [];
    allRooms: IChatRoom[] = [];
    hasPersonalMessages = false;

    isLoading = false;
    errorMessage = '';

    selectedSocietyId: string | null = null;
    selectedFlatId: string | null = null;

    private destroy$ = new Subject<void>();
    private pollIntervalMs = 60000; // Poll every 1 minute

    constructor(
        private chatService: ChatService,
        private societyService: SocietyService,
        private loginService: LoginService,
        private router: Router
    ) {}

    ngOnInit(): void {
        // Get selected society from filter
        this.societyService.selectedSocietyFilter
            .pipe(takeUntil(this.destroy$))
            .subscribe(filter => {
                this.selectedSocietyId = filter?.value || null;
                this.loadChatRooms();
            });

        // Poll for new messages
        interval(this.pollIntervalMs)
            .pipe(
                startWith(0),
                takeUntil(this.destroy$),
                switchMap(() => this.chatService.getChatRooms({
                    societyId: this.selectedSocietyId || undefined
                }))
            )
            .subscribe({
                next: (response: any) => {
                    if (response.success) {
                        this.allRooms = response.data || [];
                        this.processRooms();
                    }
                },
                error: () => {}
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadChatRooms(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.chatService.getChatRooms({
            societyId: this.selectedSocietyId || undefined
        }).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                if (response.success) {
                    this.allRooms = response.data || [];
                    this.processRooms();
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = 'Failed to load chats. Please try again.';
            }
        });
    }

    processRooms(): void {
        // Separate personal from group rooms
        this.personalRooms = this.allRooms.filter(r => r.type === 'personal');
        const groupRooms = this.allRooms.filter(r => r.type !== 'personal');

        // Sort group rooms by type priority
        const typePriority: Record<string, number> = {
            'society_all': 1,
            'society_owners_tenants': 2,
            'society_owners': 3,
            'society_owners_managers': 4,
            'building_all': 5,
            'building_owners_admins': 6,
            'flat_owner_members': 7,
            'flat_owner_tenants': 8,
            'flat_tenants': 9,
            'society_security': 10
        };

        groupRooms.sort((a, b) => {
            const pA = typePriority[a.type] || 99;
            const pB = typePriority[b.type] || 99;
            if (pA !== pB) return pA - pB;
            
            // Secondary sort by latest message time
            const timeA = a.lastMessage?.sentAt ? new Date(a.lastMessage.sentAt).getTime() : 0;
            const timeB = b.lastMessage?.sentAt ? new Date(b.lastMessage.sentAt).getTime() : 0;
            return timeB - timeA;
        });

        this.hasPersonalMessages = this.personalRooms.length > 0;

        // Group by society
        if (this.selectedSocietyId) {
            // Single society - no grouping needed
            this.groupedRooms = [{
                societyId: this.selectedSocietyId,
                societyName: this.getSocietyName(this.selectedSocietyId),
                rooms: groupRooms
            }];
        } else {
            // Group by society
            const societyMap = new Map<string, GroupedRooms>();

            for (const room of groupRooms) {
                const sId = typeof room.societyId === 'string' ? room.societyId : room.societyId?._id;
                const sName = typeof room.societyId === 'object' ? room.societyId?.societyName || 'Unknown Society' : this.getSocietyName(sId);

                if (!societyMap.has(sId)) {
                    societyMap.set(sId, { societyId: sId, societyName: sName, rooms: [] });
                }
                societyMap.get(sId)!.rooms.push(room);
            }

            this.groupedRooms = Array.from(societyMap.values());
        }
    }

    getSocietyName(societyId: string): string {
        // Try to get from socities list
        let name = '';
        this.societyService.socities.pipe(takeUntil(this.destroy$)).subscribe(socities => {
            const found = socities.find(s => s._id === societyId);
            if (found) name = found.societyName;
        });
        return name || 'Society';
    }

    openRoom(room: IChatRoom): void {
        this.router.navigate(['/chat/room', room._id]);
    }

    openSearch(): void {
        this.router.navigate(['/chat/search']);
    }

    switchTab(tab: 'society' | 'personal'): void {
        this.activeTab = tab;
    }

    getRoomTypeLabel(type: string): string {
        return this.chatService.getRoomTypeLabel(type);
    }

    getRoomIcon(type: string): string {
        return this.chatService.getRoomTypeIcon(type);
    }

    getLastMessagePreview(room: IChatRoom): string {
        if (!room.lastMessage) return 'No messages yet';
        
        const msg = room.lastMessage;
        if (!msg.content && !msg.type && !msg.messageId) return 'No messages yet';

        if (msg.type === 'text') {
            return `${msg.senderName ? msg.senderName + ': ' : ''}${msg.content || ''}`;
        }
        if (msg.type === 'image') return `${msg.senderName || ''}: 📷 Photo`;
        if (msg.type === 'video') return `${msg.senderName || ''}: 🎥 Video`;
        if (msg.type === 'document') return `${msg.senderName || ''}: 📎 Document`;
        if (msg.type === 'location') return `${msg.senderName || ''}: 📍 Location`;
        return 'Message';
    }

    getPersonalRoomName(room: IChatRoom): string {
        const profile = this.loginService.getProfileFromStorage();
        const userId = profile?.user?._id;

        if (room.type !== 'personal' || !room.participants) return room.name || 'Chat';

        const other = room.participants.find(p => p.userId?.toString() !== userId?.toString());
        return room.name || 'Personal Chat';
    }

    getTotalUnread(): number {
        return this.allRooms.reduce((sum, r) => sum + (r.unreadCount || 0), 0);
    }

    getPersonalUnreadCount(): number {
        return this.personalRooms.reduce((sum, r) => sum + (r.unreadCount || 0), 0);
    }

    formatTime(date: Date | string | undefined): string {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (diff < 60 * 1000) return 'just now';
        if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}m`;
        if (diff < oneDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diff < 7 * oneDay) {
            return d.toLocaleDateString([], { weekday: 'short' });
        }
        return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
    }

    trackByRoom(_: number, room: IChatRoom): string {
        return room._id;
    }
}
