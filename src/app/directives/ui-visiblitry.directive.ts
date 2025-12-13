import {
    Directive,
    Input,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';

@Directive({
    selector: '[uiVisible]'
})
export class UIVisibleDirective {

    constructor(
        private tpl: TemplateRef<any>,
        private vcr: ViewContainerRef
    ) { }

    @Input() set uiVisible(condition: boolean) {
        this.vcr.clear();
        if (condition) {
            this.vcr.createEmbeddedView(this.tpl);
        }
    }
}
