import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { BodyModule } from '../body/body.module';
import { FooterModule } from '../footer/footer.module';
import { HeaderModule } from '../header/header.module';
import { MenuModule } from '../menu/menu.module';
import { FormLayoutComponent } from './form-layout/form-layout.component';



@NgModule({
  declarations: [
    LayoutComponent,
    FormLayoutComponent
  ],
  imports: [
    CommonModule,
    HeaderModule,
    MenuModule,
    FooterModule,
    BodyModule
  ],
  exports: [LayoutComponent, FormLayoutComponent]
})
export class LayoutModule { }
