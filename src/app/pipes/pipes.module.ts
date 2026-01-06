import { NgModule } from '@angular/core';
import { TimeFormatPipe } from './time-format.pipe';
import { UserNamePipe } from './user-name.pope';
import { SmartDatePipe } from './smart-date.pip2';
@NgModule({
  declarations: [TimeFormatPipe, UserNamePipe, SmartDatePipe],
  exports: [TimeFormatPipe, UserNamePipe, SmartDatePipe]
})
export class PipeModule { }
