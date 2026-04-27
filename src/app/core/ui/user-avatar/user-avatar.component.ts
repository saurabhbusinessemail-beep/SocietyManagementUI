import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { IUser } from '../../../interfaces';

import { SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'ui-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent implements OnInit, OnChanges {
  @Input() user?: Partial<IUser> | any;
  @Input() name?: string;
  @Input() profilePicture?: SafeUrl | string | null;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() showLabel: boolean = false;
  
  initials: string = '?';
  displayName: string = '';
  displayPicture: SafeUrl | string | null = null;

  ngOnInit(): void {
    this.updateData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateData();
  }

  private updateData(): void {
    // If explicit inputs are provided, prefer them
    this.displayName = this.name || (this.user?.name) || 'Unknown';
    this.displayPicture = this.profilePicture || (this.user?.profilePicture) || null;
    
    // In case of flatMember.userId being an object
    if (!this.displayPicture && this.user?.userId && typeof this.user.userId !== 'string') {
        this.displayPicture = this.user.userId.profilePicture;
    }

    if (this.displayName) {
      this.initials = this.displayName.charAt(0).toUpperCase();
    }
  }
}
