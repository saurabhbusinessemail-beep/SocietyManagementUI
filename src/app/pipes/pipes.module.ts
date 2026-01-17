import { NgModule } from '@angular/core';
import { TimeFormatPipe } from './time-format.pipe';
import { UserNamePipe } from './user-name.pope';
import { SmartDatePipe } from './smart-date.pip2';
import { DatePipe } from '@angular/common';
@NgModule({
  declarations: [TimeFormatPipe, UserNamePipe, SmartDatePipe],
  exports: [TimeFormatPipe, UserNamePipe, SmartDatePipe],
  providers: [TimeFormatPipe, UserNamePipe, SmartDatePipe, DatePipe]
})
export class PipeModule { }
