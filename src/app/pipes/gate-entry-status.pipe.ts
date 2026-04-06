import { Pipe, PipeTransform } from '@angular/core';
import { IUser } from '../interfaces';
import { GateEntryStatus } from '../types';

@Pipe({
  name: 'gateEntryStatus'
})
export class GateEntryStatusPipe implements PipeTransform {

  transform(status: GateEntryStatus): string {
    let gateEntryStatusLabel = status.toString();
    switch (status) {
      case 'requested':
        gateEntryStatusLabel = 'Requested';
        break;
      case 'approved':
        gateEntryStatusLabel = 'Approved';
        break;
      case 'rejected':
        gateEntryStatusLabel = 'Rejected';
        break;
      case 'cancelled':
        gateEntryStatusLabel = 'Cancelled';
        break;
      case 'expired':
        gateEntryStatusLabel = 'Expired';
        break;
      case 'completed':
        gateEntryStatusLabel = 'Completed';
        break;
    }
    return gateEntryStatusLabel;
  }

}
