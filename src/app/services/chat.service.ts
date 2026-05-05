import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
    IChatRoom,
    IChatMessage,
    IChatSearchResult,
    IChatSendMessagePayload,
    IBEResponseFormat,
    IPagedResponse
} from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = `${environment.apiBaseUrl}/chat`;

    constructor(private http: HttpClient) {}

    // ─── Rooms ────────────────────────────────────────────────────────────────

    /**
     * Get all chat rooms accessible to the current user.
     * @param societyId Optional filter to a specific society
     * @param flatId Optional filter to a specific flat
     * @param type Optional filter by room type
     */
    getChatRooms(filters: { societyId?: string; flatId?: string; type?: string } = {}): Observable<IBEResponseFormat<IChatRoom[]>> {
        let params = new HttpParams();
        if (filters.societyId) params = params.set('societyId', filters.societyId);
        if (filters.flatId) params = params.set('flatId', filters.flatId);
        if (filters.type) params = params.set('type', filters.type);

        return this.http.get<IBEResponseFormat<IChatRoom[]>>(`${this.apiUrl}/rooms`, { params });
    }

    /**
     * Get details for a single chat room.
     */
    getRoomById(roomId: string): Observable<IBEResponseFormat<IChatRoom>> {
        return this.http.get<IBEResponseFormat<IChatRoom>>(`${this.apiUrl}/rooms/${roomId}`);
    }

    /**
     * Get paginated messages for a specific room.
     * @param roomId The chat room ID
     * @param page Page number
     * @param limit Number of messages per page
     * @param before Optional cursor for infinite scroll (ISO date string)
     */
    getRoomMessages(roomId: string, page = 1, limit = 50, before?: string): Observable<IPagedResponse<IChatMessage>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (before) params = params.set('before', before);

        return this.http.get<IPagedResponse<IChatMessage>>(
            `${this.apiUrl}/rooms/${roomId}/messages`,
            { params }
        );
    }

    /**
     * Send a message to a room.
     */
    sendMessage(roomId: string, payload: IChatSendMessagePayload): Observable<IBEResponseFormat<IChatMessage>> {
        return this.http.post<IBEResponseFormat<IChatMessage>>(
            `${this.apiUrl}/rooms/${roomId}/messages`,
            payload
        );
    }

    /**
     * Mark a room as read for the current user.
     */
    markRoomAsRead(roomId: string): Observable<IBEResponseFormat<{ readAt: string }>> {
        return this.http.patch<IBEResponseFormat<{ readAt: string }>>(
            `${this.apiUrl}/rooms/${roomId}/read`,
            {}
        );
    }

    /**
     * Clear all messages in a room for the current user.
     */
    clearChatForMe(roomId: string): Observable<IBEResponseFormat<void>> {
        return this.http.delete<IBEResponseFormat<void>>(
            `${this.apiUrl}/rooms/${roomId}/clear`
        );
    }

    /**
     * Toggle block/unblock a user in a personal chat room.
     */
    toggleBlockUser(roomId: string): Observable<IBEResponseFormat<{ isBlocked: boolean }>> {
        return this.http.post<IBEResponseFormat<{ isBlocked: boolean }>>(
            `${this.apiUrl}/rooms/${roomId}/block`,
            {}
        );
    }

    // ─── Personal Chat ────────────────────────────────────────────────────────

    /**
     * Get or create a personal chat room with a target user.
     */
    getOrCreatePersonalChat(targetUserId: string, societyId: string): Observable<IBEResponseFormat<IChatRoom>> {
        return this.http.post<IBEResponseFormat<IChatRoom>>(
            `${this.apiUrl}/personal/${targetUserId}`,
            { societyId }
        );
    }

    // ─── Messages ─────────────────────────────────────────────────────────────

    /**
     * Delete a message for everyone (only within 15 minutes).
     */
    deleteMessageForEveryone(messageId: string): Observable<IBEResponseFormat<void>> {
        return this.http.delete<IBEResponseFormat<void>>(
            `${this.apiUrl}/messages/${messageId}/everyone`
        );
    }

    /**
     * Delete a message for the current user only.
     */
    deleteMessageForMe(messageId: string): Observable<IBEResponseFormat<void>> {
        return this.http.delete<IBEResponseFormat<void>>(
            `${this.apiUrl}/messages/${messageId}/me`
        );
    }

    // ─── Search ───────────────────────────────────────────────────────────────

    /**
     * Search chat rooms and messages.
     */
    searchChats(searchTerm: string, societyId?: string, page = 1, limit = 20): Observable<IBEResponseFormat<IChatSearchResult>> {
        let params = new HttpParams()
            .set('q', searchTerm)
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (societyId) params = params.set('societyId', societyId);

        return this.http.get<IBEResponseFormat<IChatSearchResult>>(
            `${this.apiUrl}/search`,
            { params }
        );
    }

    // ─── Setup (internal use) ─────────────────────────────────────────────────

    /**
     * Ensure society-level chat rooms exist (call after creating/updating society).
     */
    ensureSocietyChats(societyId: string): Observable<IBEResponseFormat<void>> {
        return this.http.post<IBEResponseFormat<void>>(
            `${this.apiUrl}/setup/society/${societyId}`,
            {}
        );
    }

    /**
     * Ensure building-level chat room exists.
     */
    ensureBuildingChats(societyId: string, buildingId: string): Observable<IBEResponseFormat<void>> {
        return this.http.post<IBEResponseFormat<void>>(
            `${this.apiUrl}/setup/society/${societyId}/building/${buildingId}`,
            {}
        );
    }

    /**
     * Ensure flat-level chat rooms exist.
     */
    ensureFlatChats(societyId: string, flatId: string): Observable<IBEResponseFormat<void>> {
        return this.http.post<IBEResponseFormat<void>>(
            `${this.apiUrl}/setup/society/${societyId}/flat/${flatId}`,
            {}
        );
    }

    /**
     * @TODO: To be deleted in future.
     * Development/Starting Phase only: Ensure all chat rooms exist globally
     */
    ensureAllPendingChats(): Observable<IBEResponseFormat<void>> {
        return this.http.post<IBEResponseFormat<void>>(
            `${this.apiUrl}/setup/all`,
            {}
        );
    }
    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Get the display label for a room type.
     */
    getRoomTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            society_owners_tenants: 'Owners & Tenants',
            society_owners: 'Owners Only',
            society_owners_managers: 'Owners and Managers',
            society_security: 'Security',
            society_all: 'Society All Members',
            building_all: 'Building All Members',
            building_owners_admins: 'Owners & Building Admins',
            flat_owner_members: 'Flat Owner & Members',
            flat_owner_tenants: 'Flat Owner & Tenants',
            flat_tenants: 'Flat Tenants',
            personal: 'Personal Chat'
        };
        return labels[type] || 'Chat Group';
    }

    /**
     * Get the icon name for a room type.
     */
    getRoomTypeIcon(type: string): string {
        const icons: Record<string, string> = {
            society: 'apartment',
            building: 'domain',
            flat_all: 'home',
            flat_owner_tenant: 'people',
            society_all: 'groups',
            personal: 'person'
        };
        return icons[type] || 'chat';
    }

    /**
     * Check if a message can be deleted for everyone.
     * Returns true if sent within the last 15 minutes.
     */
    canDeleteForEveryone(sentAt: Date | string): boolean {
        const sent = new Date(sentAt).getTime();
        const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
        return sent > fifteenMinutesAgo;
    }

    /**
     * Format location for Google Maps URL.
     */
    getGoogleMapsUrl(lat: number, lng: number): string {
        return `https://www.google.com/maps?q=${lat},${lng}`;
    }
}
