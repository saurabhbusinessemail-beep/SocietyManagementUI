import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBoxComponent } from './text-box/text-box.component';
import { FormsModule } from '@angular/forms';
import { DropDownComponent } from './drop-down/drop-down.component';
import { SearchBoxComponent } from './search-box/search-box.component';
import { IconModule } from '../icons/icon.module';
import { RadioListComponent } from './radio-list/radio-list.component';
import { CheckListComponent } from './check-list/check-list.component';
import { TabsComponent } from './tabs/tabs.component';
import { UITabContentDirective } from './tabs/ui-tab-directive';



@NgModule({
  declarations: [
    TextBoxComponent,
    DropDownComponent,
    SearchBoxComponent,
    RadioListComponent,
    CheckListComponent,
    TabsComponent,
    UITabContentDirective
  ],
  imports: [
    CommonModule, FormsModule, IconModule
  ],
  exports: [TextBoxComponent, DropDownComponent, SearchBoxComponent, RadioListComponent, CheckListComponent, TabsComponent,
    UITabContentDirective]
})
export class UiModule { }
