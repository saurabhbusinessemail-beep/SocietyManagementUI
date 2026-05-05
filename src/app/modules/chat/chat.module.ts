import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { SearchPageComponent } from './search-page/search-page.component';

import { IconModule } from '../../core/icons/icon.module';
import { LayoutModule } from '../../core/layout/layout.module';
import { UiModule } from '../../core/ui/ui.module';
import { DirectiveModule } from '../../directives/directive.module';
import { PipeModule } from '../../pipes/pipes.module';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    declarations: [
        ChatListComponent,
        ChatWindowComponent,
        SearchPageComponent
    ],
    imports: [
        CommonModule,
        ChatRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        LayoutModule,
        UiModule,
        DirectiveModule,
        PipeModule,
        IconModule,
        MatMenuModule,
        MatButtonModule
    ]
})
export class ChatModule {}
