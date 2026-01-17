import { Directive, Output, EventEmitter, HostListener, Input, OnDestroy } from '@angular/core';

@Directive({
    selector: '[appLongTouch]'
})
export class LongTouchDirective implements OnDestroy {
    @Input() touchDuration = 1500; // Duration in milliseconds (default: 500ms)
    @Output() longTouch = new EventEmitter<void>();
    @Output() longTouchEnd = new EventEmitter<void>();

    private touchTimeout: any = null;
    private isTouching = false;

    @HostListener('touchstart', ['$event'])
    @HostListener('mousedown', ['$event'])
    onTouchStart(event: TouchEvent | MouseEvent): void {
        // Prevent context menu on long touch
        event.preventDefault();

        this.isTouching = true;

        // Clear any existing timeout
        if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
        }

        // Set timeout for long touch
        this.touchTimeout = setTimeout(() => {
            if (this.isTouching) {
                this.longTouch.emit();
            }
        }, this.touchDuration);
    }

    @HostListener('touchend')
    @HostListener('touchcancel')
    @HostListener('mouseup')
    @HostListener('mouseleave')
    onTouchEnd(): void {
        this.isTouching = false;

        if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
            this.touchTimeout = null;
        }

        this.longTouchEnd.emit();
    }

    @HostListener('contextmenu', ['$event'])
    onContextMenu(event: Event): void {
        // Prevent default context menu for touch devices
        event.preventDefault();
    }

    ngOnDestroy(): void {
        // Clean up timeout when directive is destroyed
        if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
            this.touchTimeout = null;
        }
    }
}