import { NgModule } from '@angular/core';
import { TimeFormatPipe } from './time-format.pipe';
import { UserNamePipe } from './user-name.pope';
@NgModule({
  declarations: [TimeFormatPipe, UserNamePipe],
  exports: [TimeFormatPipe, UserNamePipe]
})
export class PipeModule { }
