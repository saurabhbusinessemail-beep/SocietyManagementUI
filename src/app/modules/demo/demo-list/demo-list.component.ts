import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DemoService } from '../../../services/demo.service';
import { LoginService } from '../../../services/login.service';
import { IDemoBooking, IDemoBookingFilters } from '../../../interfaces';
import { DemoBookingStatus } from '../../../constants';

@Component({
  selector: 'app-demo-list',
  templateUrl: './demo-list.component.html',
  styleUrls: ['./demo-list.component.scss']
})
export class DemoListComponent implements OnInit {
  // Data
  bookings: IDemoBooking[] = [];
  selectedBooking: IDemoBooking | null = null;
  selectedIds: Set<string> = new Set();

   DemoBookingStatus = DemoBookingStatus;

  // Filters
  filters: IDemoBookingFilters = {
    startDate: undefined,
    endDate: undefined,
    status: undefined,
    source: undefined,
    search: undefined
  };

  // Pagination
  page: number = 1;
  limit: number = 10;
  total: number = 0;
  totalPages: number = 0;

  // Sorting
  sortField: string = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'desc';

  // UI States
  isLoading: boolean = false;
  error: string | null = null;
  isMobile: boolean = window.innerWidth <= 768;
  activeActionMenu: string | null = null;

  // Stats
  stats: any = {
    total: 0,
    pending: 0,
    pendingCount: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    converted: 0
  };

  // Modal visibility flags
  showRescheduleModal: boolean = false;
  showFeedbackModal: boolean = false;
  showCancelModal: boolean = false;
  showNoteModal: boolean = false;
  showViewModal: boolean = false;
  showBulkActionModal: boolean = false;

  // Modal data
  rescheduleData: any = { newDate: '', newTime: '', reason: '' };
  feedbackData: any = { feedback: '', rating: null };
  cancelReason: string = '';
  followUpNote: string = '';
  rejectReason: string = '';
  bulkActionType: 'approve' | 'reject' = 'approve';

  // Constants
  minDate: string = new Date().toISOString().split('T')[0];
  timeSlots: string[] = [
    '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM',
    '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  constructor(
    private demoService: DemoService,
    private router: Router,
    public loginService: LoginService
  ) {
    // Check screen size on resize
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.activeActionMenu = null; // Close mobile menu on resize to desktop
      }
    });
  }

  ngOnInit(): void {
    this.loadBookings();
  }

  // ==================== LOAD DATA ====================

  loadBookings(): void {
    this.isLoading = true;
    this.error = null;

    const pagination = {
      page: this.page,
      limit: this.limit,
      sortBy: this.sortField,
      sortOrder: this.sortOrder
    };

    this.demoService.getAllBookings(this.filters, pagination.page, pagination.limit).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.bookings = response.data;
          this.total = response.total;
          this.totalPages = Math.ceil(response.total / this.limit);
          this.calculateStats();
        } else {
          this.error = response.message || 'Failed to load bookings';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.message || 'Failed to load bookings';
      }
    });
  }

  calculateStats(): void {
    this.stats = {
      total: this.total,
      pendingCount: this.bookings.filter(b => b.status === 'pending').length,
      confirmed: this.bookings.filter(b => b.status === 'confirmed').length,
      completed: this.bookings.filter(b => b.status === 'completed').length,
      cancelled: this.bookings.filter(b => b.status === 'cancelled').length,
      converted: this.bookings.filter(b => b.convertedToCustomer).length
    };
  }

  // ==================== FILTERS ====================

  onFilterChange(): void {
    this.page = 1;
    this.loadBookings();
  }

  onSearchChange(): void {
    // Implement debounce if needed
    this.page = 1;
    this.loadBookings();
  }

  clearFilters(): void {
    this.filters = {
      startDate: undefined,
      endDate: undefined,
      status: undefined,
      source: undefined,
      search: undefined
    };
    this.page = 1;
    this.loadBookings();
  }

  get hasActiveFilters(): boolean {
    return !!(this.filters.startDate || this.filters.endDate ||
      this.filters.status || this.filters.source || this.filters.search);
  }

  // ==================== SORTING ====================

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    this.loadBookings();
  }

  // ==================== PAGINATION ====================

  goToPage(page: number): void {
    this.page = page;
    this.loadBookings();
  }

  onPageSizeChange(): void {
    this.page = 1;
    this.loadBookings();
  }

  // ==================== SELECTION ====================

  toggleSelection(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleAllSelection(): void {
    if (this.allSelected) {
      this.selectedIds.clear();
    } else {
      this.bookings.forEach(b => b._id && this.selectedIds.add(b._id));
    }
  }

  clearSelection(): void {
    this.selectedIds.clear();
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  get allSelected(): boolean {
    return this.bookings.length > 0 && this.bookings.every(b => b._id && this.selectedIds.has(b._id));
  }

  hasPendingSelected(): boolean {
    const selectedBookings = this.bookings.filter(b => b._id && this.selectedIds.has(b._id));
    return selectedBookings.some(b => b.status === 'pending');
  }

  // ==================== MOBILE ACTION MENU ====================

  toggleActionMenu(bookingId: string): void {
    if (this.activeActionMenu === bookingId) {
      this.activeActionMenu = null;
    } else {
      this.activeActionMenu = bookingId;
    }
  }

  // ==================== ACTION CHECKS ====================

  canReschedule(booking: IDemoBooking): boolean {
    return ['pending', 'confirmed'].includes(booking.status || '');
  }

  canComplete(booking: IDemoBooking): boolean {
    return booking.status === 'confirmed' || booking.status === 'rescheduled';
  }

  canConvert(booking: IDemoBooking): boolean {
    return booking.status === 'completed' && !booking.convertedToCustomer;
  }

  canCancel(booking: IDemoBooking): boolean {
    return ['pending', 'confirmed', 'rescheduled'].includes(booking.status || '');
  }

  canDelete(booking: IDemoBooking): boolean {
    return booking.status === 'cancelled' || booking.status === 'completed';
  }

  canConfirm(booking: IDemoBooking): boolean {
    return booking.status === 'pending';
  }

  canMarkNoShow(booking: IDemoBooking): boolean {
    return booking.status === 'confirmed' || booking.status === 'rescheduled';
  }

  // ==================== ACTIONS ====================

  viewBookingDetails(booking: IDemoBooking): void {
    this.selectedBooking = booking;
    this.showViewModal = true;
    this.activeActionMenu = null; // Close mobile menu
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedBooking = null;
  }

  // Confirm action
  confirmBooking(booking: IDemoBooking): void {
    this.activeActionMenu = null; // Close mobile menu
    if (confirm(`Confirm demo for ${booking.fullName}?`)) {
      this.demoService.confirmDemo(booking._id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadBookings();
            this.showSuccessToast('Demo confirmed successfully');
          } else {
            this.showErrorToast(response.message || 'Failed to confirm demo');
          }
        },
        error: (error) => this.showErrorToast(error.message)
      });
    }
  }

  // Reschedule
  openRescheduleModal(booking: IDemoBooking): void {
    this.selectedBooking = booking;
    this.rescheduleData = { newDate: '', newTime: '', reason: '' };
    this.showRescheduleModal = true;
    this.activeActionMenu = null; // Close mobile menu
  }

  confirmReschedule(): void {
    if (!this.rescheduleData.newDate || !this.rescheduleData.newTime) {
      alert('Please select both date and time');
      return;
    }

    this.demoService.rescheduleDemo(
      this.selectedBooking!._id!,
      this.rescheduleData.newDate,
      this.rescheduleData.newTime,
      this.rescheduleData.reason
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.showRescheduleModal = false;
          this.loadBookings();
          this.showSuccessToast('Demo rescheduled successfully');
        } else {
          this.showErrorToast(response.message || 'Failed to reschedule demo');
        }
      },
      error: (error) => this.showErrorToast(error.message)
    });
  }

  // Complete with feedback
  openFeedbackModal(booking: IDemoBooking): void {
    this.selectedBooking = booking;
    this.feedbackData = { feedback: '', rating: null };
    this.showFeedbackModal = true;
    this.activeActionMenu = null; // Close mobile menu
  }

  confirmComplete(): void {
    this.demoService.completeDemo(
      this.selectedBooking!._id!,
      this.feedbackData.feedback,
      this.feedbackData.rating
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.showFeedbackModal = false;
          this.loadBookings();
          this.showSuccessToast('Demo completed successfully');
        } else {
          this.showErrorToast(response.message || 'Failed to complete demo');
        }
      },
      error: (error) => this.showErrorToast(error.message)
    });
  }

  // Cancel
  openCancelModal(booking: IDemoBooking): void {
    this.selectedBooking = booking;
    this.cancelReason = '';
    this.showCancelModal = true;
    this.activeActionMenu = null; // Close mobile menu
  }

  confirmCancel(): void {
    this.demoService.cancelDemo(this.selectedBooking!._id!, this.cancelReason).subscribe({
      next: (response) => {
        if (response.success) {
          this.showCancelModal = false;
          this.loadBookings();
          this.showSuccessToast('Demo cancelled successfully');
        } else {
          this.showErrorToast(response.message || 'Failed to cancel demo');
        }
      },
      error: (error) => this.showErrorToast(error.message)
    });
  }

  // Mark as no-show
  markAsNoShow(booking: IDemoBooking): void {
    this.activeActionMenu = null; // Close mobile menu
    if (confirm(`Mark demo for ${booking.fullName} as no-show?`)) {
      this.demoService.markAsNoShow(booking._id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadBookings();
            this.showSuccessToast('Marked as no-show');
          } else {
            this.showErrorToast(response.message || 'Failed to mark as no-show');
          }
        },
        error: (error) => this.showErrorToast(error.message)
      });
    }
  }

  // Convert
  convertBooking(booking: IDemoBooking): void {
    this.activeActionMenu = null; // Close mobile menu
    if (confirm('Mark this booking as converted to customer?')) {
      this.demoService.markAsConverted(booking._id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadBookings();
            this.showSuccessToast('Marked as converted');
          } else {
            this.showErrorToast(response.message || 'Failed to mark as converted');
          }
        },
        error: (error) => this.showErrorToast(error.message)
      });
    }
  }

  // Add note
  openNoteModal(booking: IDemoBooking): void {
    this.closeAllModals();
    this.selectedBooking = booking;
    this.followUpNote = '';
    this.showNoteModal = true;
    this.activeActionMenu = null; // Close mobile menu
  }

  confirmAddNote(): void {
    if (!this.followUpNote.trim()) {
      alert('Please enter a note');
      return;
    }

    this.demoService.addFollowUpNote(this.selectedBooking!._id!, this.followUpNote).subscribe({
      next: (response) => {
        if (response.success) {
          this.showNoteModal = false;
          this.loadBookings();
          this.showSuccessToast('Note added successfully');
        } else {
          this.showErrorToast(response.message || 'Failed to add note');
        }
      },
      error: (error) => this.showErrorToast(error.message)
    });
  }

  // Delete
  deleteBooking(booking: IDemoBooking): void {
    this.activeActionMenu = null; // Close mobile menu
    if (confirm('Are you sure you want to delete this booking?')) {
      this.demoService.deleteBooking(booking._id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadBookings();
            this.showSuccessToast('Booking deleted successfully');
          } else {
            this.showErrorToast(response.message || 'Failed to delete booking');
          }
        },
        error: (error) => this.showErrorToast(error.message)
      });
    }
  }

  // ==================== BULK ACTIONS ====================

  openBulkApproveModal(): void {
    this.bulkActionType = 'approve';
    this.showBulkActionModal = true;
  }

  openBulkRejectModal(): void {
    this.bulkActionType = 'reject';
    this.rejectReason = '';
    this.showBulkActionModal = true;
  }

  confirmBulkAction(): void {
    const ids = Array.from(this.selectedIds);

    if (this.bulkActionType === 'approve') {
      this.demoService.bulkApproveBookings(ids).subscribe({
        next: (response) => {
          if (response.success) {
            this.showBulkActionModal = false;
            this.selectedIds.clear();
            this.loadBookings();
            this.showSuccessToast(response.message || 'Bookings approved successfully');
          } else {
            this.showErrorToast(response.message || 'Failed to approve bookings');
          }
        },
        error: (error) => this.showErrorToast(error.message)
      });
    } else {
      this.demoService.bulkRejectBookings(ids, this.rejectReason).subscribe({
        next: (response) => {
          if (response.success) {
            this.showBulkActionModal = false;
            this.selectedIds.clear();
            this.loadBookings();
            this.showSuccessToast(response.message || 'Bookings rejected successfully');
          } else {
            this.showErrorToast(response.message || 'Failed to reject bookings');
          }
        },
        error: (error) => this.showErrorToast(error.message)
      });
    }
  }

  bulkExport(): void {
    const selectedBookings = this.bookings.filter(b => b._id && this.selectedIds.has(b._id));
    const dataStr = JSON.stringify(selectedBookings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `bookings-export-${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    this.showSuccessToast(`${selectedBookings.length} bookings exported`);
  }

  bulkDelete(): void {
    if (confirm(`Delete ${this.selectedIds.size} selected bookings?`)) {
      this.demoService.bulkDeleteBookings(Array.from(this.selectedIds)).subscribe({
        next: (response) => {
          if (response.success) {
            this.selectedIds.clear();
            this.loadBookings();
            this.showSuccessToast(response.message || 'Bookings deleted successfully');
          } else {
            this.showErrorToast(response.message || 'Failed to delete bookings');
          }
        },
        error: (error) => this.showErrorToast(error.message)
      });
    }
  }

  exportBookings(): void {
    const dataStr = JSON.stringify(this.bookings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `all-bookings-${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    this.showSuccessToast('All bookings exported');
  }

  closeAllModals(): void {
    this.showRescheduleModal = false;
    this.showFeedbackModal = false;
    this.showCancelModal = false;
    this.showNoteModal = false;
    this.showViewModal = false;
    this.showBulkActionModal = false;
    this.selectedBooking = null;
  }

  // Toast helpers
  private showSuccessToast(message: string): void {
    // You can replace this with your actual toast service
    console.log('Success:', message);
    alert(message); // Temporary - replace with actual toast
  }

  private showErrorToast(message: string): void {
    // You can replace this with your actual toast service
    console.error('Error:', message);
    alert('Error: ' + message); // Temporary - replace with actual toast
  }
}