import { NgModule } from '@angular/core';
import { HeaderComponent } from './header.component';
import { UserIconModule } from '../user-icon/user-icon.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [HeaderComponent],
  imports: [CommonModule, UserIconModule],
  exports: [HeaderComponent],
})
export class HeaderModule { }
