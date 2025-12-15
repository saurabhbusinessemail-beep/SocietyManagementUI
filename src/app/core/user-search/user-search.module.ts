import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSearchComponent } from './user-search.component';
import { UiModule } from '../ui/ui.module';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from '../layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    UserSearchComponent
  ],
  imports: [
    CommonModule, UiModule, HttpClientModule,
    LayoutModule, FormsModule, ReactiveFormsModule
  ],
  exports: [UserSearchComponent]
})
export class UserSearchModule { }
