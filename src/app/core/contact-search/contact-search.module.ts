import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactSearchComponent } from './contact-search.component';
import { UiModule } from '../ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from '../layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ContactSearchComponent
  ],
  imports: [
    CommonModule, UiModule, HttpClientModule,
    LayoutModule, FormsModule, ReactiveFormsModule
  ],
  exports: [ContactSearchComponent]
})
export class ContactSearchModule { }
