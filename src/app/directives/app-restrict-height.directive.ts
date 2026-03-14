import {
    Directive,
    ElementRef,
    Input,
    AfterViewInit,
    OnDestroy,
    Renderer2,
    NgZone
} from '@angular/core';

@Directive({
    selector: '[appRestrictHeight]'
})
export class RestrictHeightDirective implements AfterViewInit, OnDestroy {
    @Input() appRestrictHeight: number = 200; // Default cutoff height in pixels
    @Input() restrictEnabled: boolean = true; // Enable/disable the feature

    private originalHeight: number = 0;
    private isExpanded: boolean = false;
    private wrapperDiv: HTMLDivElement | null = null;
    private showMoreElement: HTMLDivElement | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private readonly animationDuration = 300; // ms

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
        private ngZone: NgZone
    ) { }

    ngAfterViewInit(): void {
        if (!this.restrictEnabled) {
            return;
        }

        // Store the original element
        const originalElement = this.el.nativeElement;

        // Get the original height
        this.originalHeight = originalElement.offsetHeight;

        // Create wrapper structure
        this.createWrapperStructure(originalElement);

        // Check if height restriction is needed
        this.checkHeightAndApplyRestriction();

        // Observe height changes
        this.setupResizeObserver();
    }

    private createWrapperStructure(originalElement: HTMLElement): void {
        // Create wrapper div
        this.wrapperDiv = this.renderer.createElement('div');
        this.renderer.addClass(this.wrapperDiv, 'height-restriction-wrapper');

        // Style the wrapper
        this.renderer.setStyle(this.wrapperDiv, 'position', 'relative');
        this.renderer.setStyle(this.wrapperDiv, 'width', '100%');
        this.renderer.setStyle(this.wrapperDiv, 'overflow', 'hidden');
        this.renderer.setStyle(this.wrapperDiv, 'transition', `max-height ${this.animationDuration}ms ease-in-out`);

        // Insert wrapper before the original element
        const parent = originalElement.parentNode;
        this.renderer.insertBefore(parent, this.wrapperDiv, originalElement);

        // Move original element inside wrapper
        this.renderer.appendChild(this.wrapperDiv, originalElement);
    }

    private checkHeightAndApplyRestriction(): void {
        if (!this.wrapperDiv) return;

        const contentHeight = this.wrapperDiv.firstElementChild?.scrollHeight || 0;

        if (contentHeight > this.appRestrictHeight && !this.isExpanded) {
            this.applyHeightRestriction();
            this.addShowMoreButton();
        } else if (!this.isExpanded) {
            // Content doesn't exceed cutoff, remove any restrictions
            this.removeHeightRestriction();
        }
    }

    private applyHeightRestriction(): void {
        if (!this.wrapperDiv) return;

        this.renderer.setStyle(this.wrapperDiv, 'max-height', `${this.appRestrictHeight}px`);
    }

    private removeHeightRestriction(): void {
        if (!this.wrapperDiv) return;

        this.renderer.removeStyle(this.wrapperDiv, 'max-height');
    }

    private addShowMoreButton(): void {
        if (!this.wrapperDiv || this.showMoreElement) return;

        // Create show more/less button
        this.showMoreElement = this.renderer.createElement('div');
        this.renderer.addClass(this.showMoreElement, 'show-more-trigger');

        // Style the button
        this.renderer.setStyle(this.showMoreElement, 'position', 'absolute');
        this.renderer.setStyle(this.showMoreElement, 'bottom', '0');
        this.renderer.setStyle(this.showMoreElement, 'left', '0');
        this.renderer.setStyle(this.showMoreElement, 'right', '0');
        this.renderer.setStyle(this.showMoreElement, 'text-align', 'center');
        this.renderer.setStyle(this.showMoreElement, 'padding', '20px 0 10px 0');
        this.renderer.setStyle(this.showMoreElement, 'cursor', 'pointer');
        this.renderer.setStyle(this.showMoreElement, 'font-size', '14px');
        this.renderer.setStyle(this.showMoreElement, 'font-weight', '500');
        this.renderer.setStyle(this.showMoreElement, 'z-index', '10');
        this.renderer.setStyle(this.showMoreElement, 'background', 'linear-gradient(transparent, white 40%)');

        // Add click listener
        this.renderer.listen(this.showMoreElement, 'click', () => this.toggleExpand());

        // Set initial text
        this.updateButtonText();

        // Append to wrapper
        this.renderer.appendChild(this.wrapperDiv, this.showMoreElement);
    }

    private updateButtonText(): void {
        if (!this.showMoreElement) return;

        const textSpan = this.renderer.createElement('span');
        this.renderer.addClass(textSpan, 'show-more-text');

        // Apply colors based on state
        if (this.isExpanded) {
            this.renderer.setStyle(textSpan, 'color', '$color-note-gray'); // Show Less color
        } else {
            this.renderer.setStyle(textSpan, 'color', '$color-dark-blue'); // Show More color
        }

        this.renderer.setStyle(textSpan, 'transition', 'color 0.2s ease');
        this.renderer.setStyle(textSpan, 'border-bottom', '1px dashed currentColor');
        this.renderer.setStyle(textSpan, 'padding-bottom', '2px');

        const text = this.renderer.createText(this.isExpanded ? 'Show Less' : 'Show More');
        this.renderer.appendChild(textSpan, text);

        // Clear and append new text
        this.showMoreElement.innerHTML = '';
        this.renderer.appendChild(this.showMoreElement, textSpan);
    }

    private toggleExpand(): void {
        this.ngZone.run(() => {
            this.isExpanded = !this.isExpanded;

            if (!this.wrapperDiv) return;

            if (this.isExpanded) {
                // Expand to full height
                const fullHeight = (this.wrapperDiv.firstElementChild?.scrollHeight || 0) * 2;
                this.renderer.setStyle(this.wrapperDiv, 'max-height', `${fullHeight}px`);
            } else {
                // Collapse to restricted height
                this.renderer.setStyle(this.wrapperDiv, 'max-height', `${this.appRestrictHeight}px`);
            }

            // Update button text and colors
            this.updateButtonText();

            // Reposition button
            this.repositionTrigger();
        });
    }

    private repositionTrigger(): void {
        if (!this.showMoreElement || !this.wrapperDiv) return;

        // Update gradient based on expanded state
        if (this.isExpanded) {
            this.renderer.setStyle(this.showMoreElement, 'background', 'transparent');
        } else {
            this.renderer.setStyle(this.showMoreElement, 'background', 'linear-gradient(transparent, white 40%)');
        }
    }

    private setupResizeObserver(): void {
        if (typeof ResizeObserver !== 'undefined' && this.wrapperDiv) {
            this.ngZone.runOutsideAngular(() => {
                this.resizeObserver = new ResizeObserver((entries) => {
                    for (const entry of entries) {
                        const contentHeight = entry.target.scrollHeight;

                        this.ngZone.run(() => {
                            if (contentHeight > this.appRestrictHeight && !this.isExpanded) {
                                this.applyHeightRestriction();
                                if (!this.showMoreElement) {
                                    this.addShowMoreButton();
                                }
                            } else if (contentHeight <= this.appRestrictHeight) {
                                this.removeHeightRestriction();
                                if (this.showMoreElement) {
                                    this.showMoreElement.remove();
                                    this.showMoreElement = null;
                                }
                            }
                        });
                    }
                });

                this.resizeObserver.observe(this.wrapperDiv?.firstElementChild as Element);
            });
        }
    }

    ngOnDestroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        // Clean up: restore original element position if wrapper exists
        if (this.wrapperDiv && this.wrapperDiv.parentNode) {
            const originalElement = this.wrapperDiv.firstElementChild;
            if (originalElement) {
                this.renderer.insertBefore(this.wrapperDiv.parentNode, originalElement, this.wrapperDiv);
            }
            this.wrapperDiv.remove();
        }
    }
}