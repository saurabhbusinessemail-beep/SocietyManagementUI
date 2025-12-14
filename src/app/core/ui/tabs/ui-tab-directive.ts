import { Directive, Input, TemplateRef } from '@angular/core';


@Directive({
    selector: '[uiTab]'
})
export class UITabContentDirective {
    @Input('uiTab') tabId!: string;


    constructor(public template: TemplateRef<any>) { }
}