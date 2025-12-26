import { Pipe, PipeTransform } from '@angular/core';
import { IUser } from '../interfaces';

@Pipe({
  name: 'userName'
})
export class UserNamePipe implements PipeTransform {

  transform(user: string | IUser | undefined | null, hideNoName = false): string {
    if (!user || typeof user === 'string') return '';

    return (user.name ?? (!hideNoName ? 'No Name' : '')) + ' ' + user.phoneNumber;
  }

}
