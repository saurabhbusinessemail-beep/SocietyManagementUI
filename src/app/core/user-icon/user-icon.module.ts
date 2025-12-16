import { NgModule } from '@angular/core';
import { UserIconComponent } from './user-icon.component';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icons/icon.module';

@NgModule({
  declarations: [UserIconComponent],
  imports: [CommonModule, IconModule],
  exports: [UserIconComponent],
})
export class UserIconModule { }
