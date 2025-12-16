import { NgModule } from '@angular/core';
import { HeaderComponent } from './header.component';
import { UserIconModule } from '../user-icon/user-icon.module';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icons/icon.module';
import { MoreIconModule } from '../more-icon/more-icon.module';

@NgModule({
  declarations: [HeaderComponent],
  imports: [CommonModule, UserIconModule, IconModule, MoreIconModule],
  exports: [HeaderComponent],
})
export class HeaderModule { }
