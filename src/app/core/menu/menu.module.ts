import { NgModule } from '@angular/core';
import { MenuComponent } from './menu.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [MenuComponent],
  imports: [CommonModule, FormsModule, RouterModule],
  exports: [MenuComponent],
})
export class MenuModule { }
