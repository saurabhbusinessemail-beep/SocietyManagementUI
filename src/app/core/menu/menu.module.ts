import { NgModule } from '@angular/core';
import { MenuComponent } from './menu.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icons/icon.module';

@NgModule({
  declarations: [MenuComponent],
  imports: [CommonModule, FormsModule, RouterModule, IconModule],
  exports: [MenuComponent],
})
export class MenuModule { }
