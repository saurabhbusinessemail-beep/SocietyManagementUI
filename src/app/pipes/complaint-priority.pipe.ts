import { Pipe, PipeTransform } from '@angular/core';
import { IUser } from '../interfaces';

@Pipe({
  name: 'complaintPriority'
})
export class ComplaintPriorityPipe implements PipeTransform {

  transform(prority: string): string {
    let prorityLabel = prority;
    switch (prority) {
      case 'low':
        prorityLabel = 'Low';
        break;
      case 'medium':
        prorityLabel = 'Medium';
        break;
      case 'high':
        prorityLabel = 'High';
        break;
      case 'urgent':
        prorityLabel = 'Urgent';
        break;
    }
    return prorityLabel;
  }

}
