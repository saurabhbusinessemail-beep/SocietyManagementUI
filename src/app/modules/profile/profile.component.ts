import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject, take, takeUntil } from 'rxjs';
import { UserNameInputPopupComponent } from '../../core/user-name-popup/user-name-input-popup.component';
import { IMyProfile, IUser } from '../../interfaces';
import { LoginService } from '../../services/login.service';
import { UserService } from '../../services/user.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile?: IMyProfile;
  user: IUser | null = null;
  isLoading = false;
  error: string = '';
  profilePictureUrl: SafeUrl | string | null = null;
  isUploading = false;
  private dialogRef: MatDialogRef<UserNameInputPopupComponent> | undefined;
  private destroy$ = new Subject<void>();

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private userService: UserService,
    private loginService: LoginService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loadProfile();
    this.loadProfilePicture();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  loadProfile(): void {
    this.isLoading = true;
    this.profile = this.loginService.getProfileFromStorage();

    if (this.profile?.user) {
      this.user = this.profile.user;
      this.isLoading = false;
    } else {
      this.loginService.loadProfile()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response?.success) {
              this.profile = this.loginService.getProfileFromStorage();
              this.user = this.profile?.user || null;
            }
            this.isLoading = false;
          },
          error: (error) => {
            this.error = 'Failed to load profile';
            this.isLoading = false;
            console.error('Error loading profile:', error);
          }
        });
    }
  }

  loadProfilePicture(): void {
    // Try to load from localStorage first
    const savedPicture = this.userService.getProfilePictureToStorage();
    if (savedPicture) {
      this.profilePictureUrl = this.sanitizer.bypassSecurityTrustUrl(savedPicture);
    } else {
      // Or fetch from server if you have an endpoint
      // this.userService.getProfilePicture().subscribe(...)
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      console.log('File size should be less than 2MB');
      return;
    }

    this.isUploading = true;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64Image = e.target.result;

      // Show preview immediately
      this.profilePictureUrl = this.sanitizer.bypassSecurityTrustUrl(base64Image);

      // Upload to server
      this.userService.uploadProfilePicture(base64Image)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response?.success) {

              // Update user object
              if (this.user) {
                this.user.profilePicture = base64Image;
              }

              // Save to localStorage for persistence
              this.userService.saveProfilePictureToStorage(base64Image);
            }
            this.isUploading = false;
          },
          error: (error) => {
            console.error('Error uploading profile picture:', error);
            console.log('Failed to upload profile picture');
            // Revert preview on error
            this.loadProfilePicture();
            this.isUploading = false;
          }
        });
    };
    reader.readAsDataURL(file);
  }

  openEditNameDialog(): void {
    if (!this.user || this.dialogRef) return;

    this.dialogRef = this.dialog.open(UserNameInputPopupComponent, {
      data: { userName: this.user.name }
    });

    this.dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe((userName: string | any) => {
        this.dialogRef = undefined;
        if (!userName || typeof userName !== 'string') return;

        this.updateUserName(userName);
      });
  }

  private updateUserName(userName: string): void {
    this.userService.updateMyUserName(userName)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          if (!response.success) return;

          this.updateUserToken(response.token);
        },
        error: (error) => {
          console.error('Error updating name:', error);
        }
      });
  }

  private updateUserToken(token: string): void {
    this.loginService.saveTokenToStorage(token);
    this.loginService.loadProfile()
      .pipe(take(1))
      .subscribe((response: any) => {
        if (!response || !response.success) {
          return;
        }

        // Update local user data
        this.profile = this.loginService.getProfileFromStorage();
        this.user = this.profile?.user || null;
      });
  }

  getInitial(): string {
    return this.user?.name?.charAt(0) || this.user?.email?.charAt(0) || 'U';
  }

  getStatusClass(): string {
    return `status-${this.user?.status || 'inactive'}`;
  }
}