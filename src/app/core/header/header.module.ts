import { NgModule } from '@angular/core';
import { HeaderComponent } from './header.component';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icons/icon.module';
import { MoreIconModule } from '../more-icon/more-icon.module';
import { UiModule } from '../ui/ui.module';
import { ConsoleModule } from '../console/console.module';
import { StorageModule } from '../storage/storage.module';
import { DirectiveModule } from '../../directives/directive.module';
import { ApiTrackerModule } from '../api-tracker/api-tracker.module';

@NgModule({
  declarations: [HeaderComponent],
  imports: [CommonModule, IconModule, MoreIconModule, UiModule, ConsoleModule, StorageModule, ApiTrackerModule, DirectiveModule],
  exports: [HeaderComponent],
})
export class HeaderModule { }
