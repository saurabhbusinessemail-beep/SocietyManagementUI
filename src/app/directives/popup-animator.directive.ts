import {
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';

@Directive({
    selector: '[popupAnimator]'
})
export class PopupAnimatorDirective implements OnInit, OnChanges {
    @HostBinding('class.open') isOpen = false;

    @Input() popupClose = false;
    @Output() popupHidden = new EventEmitter<void>();

    private readonly animationDuration = 300;
    private closing = false;

    constructor(private el: ElementRef<HTMLElement>) { }

    ngOnInit(): void {
        requestAnimationFrame(() => {
            this.isOpen = true;
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['popupClose']?.currentValue === true) {
            this.close();
        }
    }

    @HostListener('click')
    onBackdropClick() {
        this.close();
    }

    private close() {
        if (this.closing) return;
        this.closing = true;

        this.isOpen = false;

        setTimeout(() => {
            this.popupHidden.emit();
        }, this.animationDuration);
    }
}
