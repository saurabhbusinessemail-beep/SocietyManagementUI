import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBoxComponent } from './text-box/text-box.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropDownComponent } from './drop-down/drop-down.component';
import { SearchBoxComponent } from './search-box/search-box.component';
import { IconModule } from '../icons/icon.module';
import { RadioListComponent } from './radio-list/radio-list.component';
import { CheckListComponent } from './check-list/check-list.component';
import { TabsComponent } from './tabs/tabs.component';
import { UITabContentDirective } from './tabs/ui-tab-directive';
import { LabelComponent } from './label/label.component';
import { ButtonComponent } from './button/button.component';
import { MatRippleModule } from '@angular/material/core';
import { UserIconComponent } from './user-icon/user-icon.component';
import { UserSearchComponent } from './user-search/user-search.component';
import { ContactSearchComponent } from './contact-search/contact-search.component';
import { LocationSearchComponent } from './location-search/location-search.component';
import { DirectiveModule } from '../../directives/directive.module';
import { GeoSearchComponent } from './geo-search/geo-search.component';
import { CardComponent } from './card/card.component';
import { ChipComponent } from './chip/chip.component';



@NgModule({
  declarations: [
    TextBoxComponent,
    DropDownComponent,
    SearchBoxComponent,
    RadioListComponent,
    CheckListComponent,
    TabsComponent,
    UITabContentDirective,
    LabelComponent,
    ButtonComponent,
    UserIconComponent,
    UserSearchComponent,
    ContactSearchComponent,
    LocationSearchComponent,
    GeoSearchComponent,
    CardComponent,
    ChipComponent
  ],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, IconModule, MatRippleModule,
    DirectiveModule
  ],
  exports: [TextBoxComponent,
    DropDownComponent,
    SearchBoxComponent,
    RadioListComponent,
    CheckListComponent,
    TabsComponent,
    UITabContentDirective,
    LabelComponent,
    ButtonComponent,
    UserIconComponent,
    UserSearchComponent,
    ContactSearchComponent,
    LocationSearchComponent,
    GeoSearchComponent,
    CardComponent,
    ChipComponent
  ]
})
export class UiModule { }
