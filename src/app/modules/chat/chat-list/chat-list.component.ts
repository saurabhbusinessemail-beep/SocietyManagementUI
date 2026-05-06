import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, interval, take, combineLatest } from 'rxjs';
import { takeUntil, switchMap, startWith } from 'rxjs/operators';

import { ChatService } from '../../../services/chat.service';
import { SocietyService } from '../../../services/society.service';
import { LoginService } from '../../../services/login.service';
import { PushNotificationService } from '../../../services/push-notification.service';
import { IChatRoom, IChatMessage, ISociety, IMyFlatResponse } from '../../../interfaces';
import { Capacitor } from '@capacitor/core';

interface BuildingGroup {
    buildingId: string;
    buildingNumber: string;
    flats: IMyFlatResponse[];
}

interface SocietyMenuData {
    societyId: string;
    societyName: string;
}

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
    selectedSociety: ISociety | null = null;

    menuData: SocietyMenuData[] = [];
    isMenuOpen = false;

    private destroy$ = new Subject<void>();
    private pollIntervalMs = 60000; // Poll every 1 minute

    constructor(
        private chatService: ChatService,
        private societyService: SocietyService,
        private loginService: LoginService,
        private router: Router,
        private route: ActivatedRoute,
        private el: ElementRef,
        private pushNotificationService: PushNotificationService
    ) { }

    ngOnInit(): void {
        // Check for societyId in URL on refresh
        const urlParams = this.route.snapshot.queryParams;
        if (urlParams['societyId'] && !this.societyService.selectedSocietyFilterValue) {
            this.societyService.socities.pipe(take(1)).subscribe(societies => {
                const soc = societies.find(s => s._id === urlParams['societyId']);
                if (soc) {
                    this.societyService.selectSocietyFilter({
                        label: soc.societyName,
                        value: soc._id
                    });
                }
            });
        }

        combineLatest([
            this.route.queryParams,
            this.societyService.selectedSocietyFilter
        ])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([params, filter]) => {
                const newSocId = params['societyId'] || filter?.value || null;

                if (newSocId !== this.selectedSocietyId) {
                    this.selectedSocietyId = newSocId;

                    // If societyId is in params but not in filter, sync it
                    if (params['societyId'] && filter?.value !== params['societyId']) {
                        this.syncSocietyFromParam(params['societyId']);
                    }

                    this.loadChatRooms();
                    this.updateSelectedInfo();
                }
            });

        this.loadMenuData();

        // Listen for real-time messages via FCM
        this.pushNotificationService.chatMessage$.pipe(
            takeUntil(this.destroy$)
        ).subscribe(data => {
            console.log('Real-time chat message received in list:', data);
            this.handleRealTimeMessage(data);
        });

        // Fallback polling for Web platform
        if (Capacitor.getPlatform() === 'web') {
            interval(this.pollIntervalMs)
                .pipe(
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
                    error: () => { }
                });
        }
    }

    private handleRealTimeMessage(data: any): void {
        const roomId = data.roomId;
        const roomIndex = this.allRooms.findIndex(r => r._id === roomId);

        if (roomIndex >= 0) {
            const room = this.allRooms[roomIndex];

            // Update last message
            room.lastMessage = {
                messageId: data.messageId,
                content: data.content,
                type: data.type || 'text',
                sentAt: data.sentAt,
                senderName: data.senderName,
                sentByUserId: data.senderId
            };

            // Increment unread count if we're not currently in that room and message is not from me
            const currentUserId = this.loginService.getProfileFromStorage()?.user?._id;
            if (!this.router.url.includes(`/chat/room/${roomId}`) && data.senderId !== currentUserId) {
                room.unreadCount = (room.unreadCount || 0) + 1;
            }

            // Move room to top and re-process
            this.processRooms();
        } else {
            // Room not in current list (maybe a new room?), reload
            this.loadChatRooms();
        }
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

    loadMenuData(): void {
        this.societyService.socities.pipe(takeUntil(this.destroy$)).subscribe(societies => {
            this.menuData = societies.map(soc => ({
                societyId: soc._id,
                societyName: soc.societyName
            }));
            this.updateSelectedInfo();
        });
    }

    updateSelectedInfo(): void {
        if (this.selectedSocietyId) {
            this.societyService.socities.pipe(take(1)).subscribe(societies => {
                this.selectedSociety = societies.find(s => s._id === this.selectedSocietyId) || null;
            });
        } else {
            this.selectedSociety = null;
        }
    }

    toggleMenu(event: Event): void {
        event.stopPropagation();
        this.isMenuOpen = !this.isMenuOpen;
    }

    syncSocietyFromParam(socId: string): void {
        this.societyService.socities.pipe(take(1)).subscribe(societies => {
            const soc = societies.find(s => s._id === socId);
            if (soc) {
                this.societyService.selectSocietyFilter({
                    label: soc.societyName,
                    value: soc._id
                });
            }
        });
    }

    selectSociety(soc: SocietyMenuData): void {
        this.isMenuOpen = false;
        this.societyService.selectSocietyFilter({
            label: soc.societyName,
            value: soc.societyId
        });
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                societyId: soc.societyId,
                flatId: null
            },
            queryParamsHandling: 'merge'
        });
    }

    getDisplayTitle(): string {
        return this.selectedSociety?.societyName || 'Chats';
    }

    processRooms(): void {
        // Separate personal from group rooms
        this.personalRooms = this.allRooms.filter(r => r.type === 'personal');
        const groupRooms = this.allRooms.filter(r => r.type !== 'personal');

        // Sort group rooms by type priority
        const typePriority: Record<string, number> = {
            'society_all': 1,
            'society_managers_owners_tenants': 2,
            'society_owners_tenants': 3,
            'society_owners': 4,
            'society_owners_managers': 5,
            'building_all': 6,
            'building_owners_admins': 7,
            'flat_owner_members': 8,
            'flat_owner_tenants': 9,
            'flat_tenants': 10,
            'society_security': 11
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
