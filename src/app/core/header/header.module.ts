import { NgModule } from '@angular/core';
import { HeaderComponent } from './header.component';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icons/icon.module';
import { MoreIconModule } from '../more-icon/more-icon.module';
import { UiModule } from '../ui/ui.module';

@NgModule({
  declarations: [HeaderComponent],
  imports: [CommonModule, IconModule, MoreIconModule, UiModule],
  exports: [HeaderComponent],
})
export class HeaderModule { }
