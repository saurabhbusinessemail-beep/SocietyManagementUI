import { Pipe, PipeTransform } from '@angular/core';
import { IUser } from '../interfaces';

@Pipe({
  name: 'complaintStatus'
})
export class ComplaintStatusPipe implements PipeTransform {

  transform(status: string): string {
    let statusLabel = status;
    switch (status) {
      case 'submitted':
        statusLabel = 'Submitted';
        break;
      case 'approved':
        statusLabel = 'Approved';
        break;
      case 'in_progress':
        statusLabel = 'In Progress';
        break;
      case 'resolved':
        statusLabel = 'Resolved';
        break;
      case 'closed':
        statusLabel = 'Closed';
        break;
      case 'rejected':
        statusLabel = 'Rejected';
        break;
    }
    return statusLabel
  }

}
