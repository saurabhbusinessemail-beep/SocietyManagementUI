import { NgModule } from '@angular/core';
import { TimeFormatPipe } from './time-format.pipe';
import { UserNamePipe } from './user-name.pope';
import { SmartDatePipe } from './smart-date.pip2';
import { DatePipe } from '@angular/common';
import { FilterByStatusPipe } from './filter-by-status.pipe';
@NgModule({
  declarations: [TimeFormatPipe, UserNamePipe, SmartDatePipe, FilterByStatusPipe],
  exports: [TimeFormatPipe, UserNamePipe, SmartDatePipe, FilterByStatusPipe],
  providers: [TimeFormatPipe, UserNamePipe, SmartDatePipe, DatePipe]
})
export class PipeModule { }
