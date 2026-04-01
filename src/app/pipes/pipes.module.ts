import { NgModule } from '@angular/core';
import { TimeFormatPipe } from './time-format.pipe';
import { UserNamePipe } from './user-name.pope';
import { SmartDatePipe } from './smart-date.pip2';
import { DatePipe } from '@angular/common';
import { FilterByStatusPipe } from './filter-by-status.pipe';
import { FormattedPricePipe } from './formatted-price.pipe';
@NgModule({
  declarations: [TimeFormatPipe, UserNamePipe, SmartDatePipe, FilterByStatusPipe, FormattedPricePipe],
  exports: [TimeFormatPipe, UserNamePipe, SmartDatePipe, FilterByStatusPipe, FormattedPricePipe],
  providers: [TimeFormatPipe, UserNamePipe, SmartDatePipe, DatePipe, FormattedPricePipe]
})
export class PipeModule { }
