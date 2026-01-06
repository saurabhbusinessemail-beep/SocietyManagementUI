import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'smartDate', pure: true })
export class SmartDatePipe implements PipeTransform {

    private datePipe = new DatePipe('en-IN');

    transform(value: Date | string | number): string {
        if (!value) return '';

        const date = new Date(value);
        const today = new Date();

        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const diffDays =
            (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';

        const sameYear = today.getFullYear() === date.getFullYear();

        return this.datePipe.transform(
            date,
            sameYear ? 'dd/MMM' : 'dd/MMM/yy'
        )!;
    }
}
