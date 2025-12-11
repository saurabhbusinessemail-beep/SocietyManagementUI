import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TimeFormatPipe } from './time-format.pipe';
@NgModule({
  declarations: [TimeFormatPipe],
  exports: [TimeFormatPipe]
})
export class PipeModule { }
