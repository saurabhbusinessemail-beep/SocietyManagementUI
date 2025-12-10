import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { IconComponent } from './icon.component';
import { IconsService } from './icons.service';

@NgModule({
  declarations: [IconComponent],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [IconComponent]
})
export class IconModule {
  constructor() {
  }
}
