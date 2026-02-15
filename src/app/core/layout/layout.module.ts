import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout.component';
import { BodyModule } from '../body/body.module';
import { FooterModule } from '../footer/footer.module';
import { HeaderModule } from '../header/header.module';
import { MenuModule } from '../menu/menu.module';
import { FormLayoutComponent } from './form-layout/form-layout.component';
import { DirectiveModule } from '../../directives/directive.module';
import { AddEditPopupComponent } from './add-edit-popup/add-edit-popup.component';



@NgModule({
  declarations: [
    LayoutComponent,
    FormLayoutComponent,
    AddEditPopupComponent
  ],
  imports: [
    CommonModule,
    HeaderModule,
    MenuModule,
    FooterModule,
    BodyModule,
    DirectiveModule
  ],
  exports: [LayoutComponent, FormLayoutComponent, AddEditPopupComponent]
})
export class LayoutModule { }
