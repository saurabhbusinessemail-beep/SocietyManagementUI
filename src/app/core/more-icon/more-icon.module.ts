import { NgModule } from '@angular/core';
import { MoreIconComponent } from './more-icon.component';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icons/icon.module';

@NgModule({
  declarations: [MoreIconComponent],
  imports: [CommonModule, IconModule],
  exports: [MoreIconComponent],
})
export class MoreIconModule { }
