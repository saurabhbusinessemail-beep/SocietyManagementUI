import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiTrackerComponent } from './api-tracker.component';
import { JsonViewerComponent } from './json-viewer/json-viewer.component';



@NgModule({
  declarations: [
    ApiTrackerComponent,
    JsonViewerComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ApiTrackerModule { }
