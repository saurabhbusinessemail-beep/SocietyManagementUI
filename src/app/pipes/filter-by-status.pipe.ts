import { Pipe, PipeTransform } from '@angular/core';
import { IDemoBooking } from '../interfaces';

@Pipe({
    name: 'filterByStatus'
})
export class FilterByStatusPipe implements PipeTransform {
    transform(bookings: IDemoBooking[], status: string): number {
        return bookings.filter(b => b.status === status).length;
    }
}