import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChildren, EventEmitter, Input, OnChanges, Output, QueryList, SimpleChanges } from '@angular/core';
import { IUIDropdownOption } from '../../../interfaces';
import { UIBaseFormControl } from '../../../directives';
import { UITabContentDirective } from './ui-tab-directive';

@Component({
  selector: 'ui-tabs',
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent extends UIBaseFormControl<string>
  implements OnChanges, AfterContentInit {


  @Input() tabs: IUIDropdownOption[] = [];
  @Input() tab: string = '';
  @Input() direction: 'horizontal' | 'vertical' = 'horizontal';
  @Input() height?: string; // e.g. '300px', '100%'
  @Input() manageContent = true; // true = tabs handle content switching


  @Output() tabChange = new EventEmitter<string>();

  @ContentChildren(UITabContentDirective)
  tabContents!: QueryList<UITabContentDirective>;


  activeContent?: UITabContentDirective;

  override ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);

    if (changes['tab']) {
      this.selectTab(this.tab);
    }
  }

  override writeValue(value: string): void {
    this.value = value || this.tabs[0]?.value;
    this.resolveActiveContent();
  }

  ngAfterContentInit(): void {
    if (!this.value && this.tabs.length) {
      this.updateValue(this.tabs[0].value);
    }
    this.resolveActiveContent();
  }

  selectTab(tabId: string): void {
    if (this.disabled || this.value === tabId) return;

    this.updateValue(tabId);      // ← updates FormControl
    this.resolveActiveContent();
    this.tabChange.emit(tabId);   // optional
  }

  isActive(tabId: string): boolean {
    return this.value === tabId;
  }

  private resolveActiveContent(): void {
    if (!this.manageContent || !this.tabContents) return;

    this.activeContent = this.tabContents.find(
      c => c.tabId === this.value
    );
  }
}
