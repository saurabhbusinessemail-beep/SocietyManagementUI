import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { PendingHttpService } from '../services/pending-http.service';

@Directive({
    selector: '[appLoadingOverlay]'
})
export class LoadingOverlayDirective implements OnInit, OnDestroy {
    private overlayElement: HTMLElement | null = null;
    private spinnerElement: HTMLElement | null = null;
    private subscription: Subscription = new Subscription();

    @Input('appLoadingOverlay') loadingCondition: boolean | string = false;
    @Input() overlayColor: string = 'rgba(255, 255, 255, 0.7)';
    @Input() spinnerColor: string = '#3f51b5';
    @Input() spinnerSize: string = '40px';
    @Input() spinnerThickness: string = '4px';
    @Input() useHttpInterceptor: boolean = false;

    constructor(
        private el: ElementRef,
        private renderer: Renderer2,
        private pendingHttpService: PendingHttpService
    ) { }

    ngOnInit(): void {
        if (this.useHttpInterceptor) {
            // Subscribe to HTTP pending count changes
            this.subscription.add(
                this.pendingHttpService.pendingCount$.subscribe(count => {
                    const isLoading = count > 0;
                    this.toggleOverlay(isLoading);
                })
            );
        } else {
            // Watch for manual loading condition changes
            this.toggleOverlay(this.getLoadingState());
        }
    }

    private getLoadingState(): boolean {
        if (typeof this.loadingCondition === 'string') {
            return this.loadingCondition === 'true';
        }
        return Boolean(this.loadingCondition);
    }

    private toggleOverlay(show: boolean): void {
        if (show) {
            this.createOverlay();
        } else {
            this.removeOverlay();
        }
    }

    private createOverlay(): void {
        if (this.overlayElement) return;

        // Create overlay element
        this.overlayElement = this.renderer.createElement('div');
        this.renderer.setStyle(this.overlayElement, 'position', 'absolute');
        this.renderer.setStyle(this.overlayElement, 'top', '0');
        this.renderer.setStyle(this.overlayElement, 'left', '0');
        this.renderer.setStyle(this.overlayElement, 'width', '100%');
        this.renderer.setStyle(this.overlayElement, 'height', '100%');
        this.renderer.setStyle(this.overlayElement, 'background', this.overlayColor);
        this.renderer.setStyle(this.overlayElement, 'z-index', '1000');
        this.renderer.setStyle(this.overlayElement, 'display', 'flex');
        this.renderer.setStyle(this.overlayElement, 'align-items', 'center');
        this.renderer.setStyle(this.overlayElement, 'justify-content', 'center');
        this.renderer.setStyle(this.overlayElement, 'border-radius', 'inherit');

        // Create spinner element
        this.spinnerElement = this.renderer.createElement('div');
        this.renderer.setStyle(this.spinnerElement, 'border', `${this.spinnerThickness} solid #f3f3f3`);
        this.renderer.setStyle(this.spinnerElement, 'border-top', `${this.spinnerThickness} solid ${this.spinnerColor}`);
        this.renderer.setStyle(this.spinnerElement, 'border-radius', '50%');
        this.renderer.setStyle(this.spinnerElement, 'width', this.spinnerSize);
        this.renderer.setStyle(this.spinnerElement, 'height', this.spinnerSize);
        this.renderer.setStyle(this.spinnerElement, 'animation', 'spin 1s linear infinite');

        // Append spinner to overlay
        this.renderer.appendChild(this.overlayElement, this.spinnerElement);

        // Add overlay to host element
        this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
        this.renderer.appendChild(this.el.nativeElement, this.overlayElement);

        // Add CSS animation if not already present
        this.addSpinAnimation();
    }

    private removeOverlay(): void {
        if (this.overlayElement) {
            this.renderer.removeChild(this.el.nativeElement, this.overlayElement);
            this.overlayElement = null;
            this.spinnerElement = null;
        }
    }

    private addSpinAnimation(): void {
        // Check if animation already exists
        if (document.querySelector('style[data-spin-animation]')) {
            return;
        }

        const style = this.renderer.createElement('style');
        this.renderer.setAttribute(style, 'data-spin-animation', 'true');
        this.renderer.setProperty(style, 'textContent', `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `);
        this.renderer.appendChild(document.head, style);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.removeOverlay();
    }
}