import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';

import { ChatService } from '../../../services/chat.service';
import { SocietyService } from '../../../services/society.service';
import { IChatRoom, IChatMessage, IChatSearchResult } from '../../../interfaces';

@Component({
    selector: 'app-search-page',
    templateUrl: './search-page.component.html',
    styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit, OnDestroy {

    searchControl = new FormControl('');
    matchingRooms: IChatRoom[] = [];
    matchingMessages: IChatMessage[] = [];
    isSearching = false;
    hasSearched = false;
    searchTerm = '';

    private destroy$ = new Subject<void>();
    private selectedSocietyId: string | null = null;

    constructor(
        private chatService: ChatService,
        private societyService: SocietyService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.societyService.selectedSocietyFilter
            .pipe(takeUntil(this.destroy$))
            .subscribe(filter => {
                this.selectedSocietyId = filter?.value || null;
            });

        this.searchControl.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            takeUntil(this.destroy$),
            switchMap(value => {
                const term = value?.trim() || '';
                this.searchTerm = term;

                if (term.length < 2) {
                    this.matchingRooms = [];
                    this.matchingMessages = [];
                    this.hasSearched = false;
                    return [];
                }

                this.isSearching = true;
                return this.chatService.searchChats(term, this.selectedSocietyId || undefined);
            })
        ).subscribe({
            next: (response: any) => {
                this.isSearching = false;
                this.hasSearched = true;

                if (response && response.success) {
                    const result = response.data as IChatSearchResult;
                    this.matchingRooms = result.rooms || [];
                    this.matchingMessages = result.messages || [];
                } else if (Array.isArray(response)) {
                    // Empty from short query
                    this.matchingRooms = [];
                    this.matchingMessages = [];
                }
            },
            error: () => {
                this.isSearching = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openRoom(roomId: string): void {
        this.router.navigate(['/chat/room', roomId]);
    }

    goBack(): void {
        this.router.navigate(['/chat/list']);
    }

    formatTime(date: Date | string | undefined): string {
        if (!date) return '';
        const d = new Date(date);
        const today = new Date();
        const diff = today.getTime() - d.getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (diff < oneDay) {
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
    }

    getRoomIcon(type: string): string {
        return this.chatService.getRoomTypeIcon(type);
    }

    highlightText(text: string | undefined, term: string): string {
        if (!text || !term) return text || '';
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
    }

    get totalResults(): number {
        return this.matchingRooms.length + this.matchingMessages.length;
    }

    clearSearch(): void {
        this.searchControl.setValue('');
        this.matchingRooms = [];
        this.matchingMessages = [];
        this.hasSearched = false;
    }
}
