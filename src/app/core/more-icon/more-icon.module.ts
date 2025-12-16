import { NgModule } from '@angular/core';
import { MoreIconComponent } from './more-icon.component';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icons/icon.module';
import { MatRippleModule } from '@angular/material/core';

@NgModule({
  declarations: [MoreIconComponent],
  imports: [CommonModule, IconModule, MatRippleModule],
  exports: [MoreIconComponent],
})
export class MoreIconModule { }
