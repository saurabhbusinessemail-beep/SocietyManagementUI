import { NgModule } from '@angular/core';
import { MenuComponent } from './menu.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IconModule } from '../icons/icon.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [MenuComponent],
  imports: [CommonModule, FormsModule, RouterModule, IconModule, TranslateModule.forChild()],
  exports: [MenuComponent],
})
export class MenuModule { }
