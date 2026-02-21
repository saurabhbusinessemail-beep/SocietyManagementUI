import { NgModule } from '@angular/core';
import { FooterComponent } from './footer.component';
import { CommonModule } from '@angular/common';
import { IconModule } from "../icons/icon.module";
import { UiModule } from "../ui/ui.module";

@NgModule({
  declarations: [FooterComponent],
  imports: [CommonModule, IconModule, UiModule],
  exports: [FooterComponent],
})
export class FooterModule { }
