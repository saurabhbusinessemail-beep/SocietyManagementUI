import { NgModule } from '@angular/core';
import { TimeFormatPipe } from './time-format.pipe';
import { UserNamePipe } from './user-name.pope';
import { SmartDatePipe } from './smart-date.pip2';
import { DatePipe } from '@angular/common';
import { FilterByStatusPipe } from './filter-by-status.pipe';
import { FormattedPricePipe } from './formatted-price.pipe';
import { ComplaintPriorityPipe } from './complaint-priority.pipe';
import { ComplaintStatusPipe } from './complaint-status.pipe';
import { GateEntryStatusPipe } from './gate-entry-status.pipe';
import { SafeUrlPipe } from './safe-url.pipe';
@NgModule({
  declarations: [TimeFormatPipe, UserNamePipe, SmartDatePipe, FilterByStatusPipe, FormattedPricePipe, ComplaintPriorityPipe, ComplaintStatusPipe,
    GateEntryStatusPipe, SafeUrlPipe
  ],
  exports: [TimeFormatPipe, UserNamePipe, SmartDatePipe, FilterByStatusPipe, FormattedPricePipe, ComplaintPriorityPipe, ComplaintStatusPipe,
    GateEntryStatusPipe, SafeUrlPipe
  ],
  providers: [TimeFormatPipe, UserNamePipe, SmartDatePipe, DatePipe, FormattedPricePipe]
})
export class PipeModule { }
