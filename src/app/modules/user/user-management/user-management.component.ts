// user-management.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { IUser } from '../../../interfaces';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: IUser[] = [];
  filteredUsers: IUser[] = [];
  selectedUser: IUser | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalUsers = 0;

  // Search
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Modals
  showUserModal = false;
  showDeleteModal = false;
  showViewModal = false;
  showEditModal = false;

  // Forms
  userForm: FormGroup;
  editForm: FormGroup;

  // Loading states
  isLoading = false;
  isSubmitting = false;

  // Filters
  statusFilter = 'all';
  roleFilter = 'all';

  // Status colors mapping
  statusColors = {
    active: '$status-active',
    inactive: '$status-inactive',
    pending: '$status-pending',
    blocked: '$status-rejected'
  };

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.createUserForm();
    this.editForm = this.createUserForm();
  }

  ngOnInit(): void {
    this.loadUsers();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createUserForm(): FormGroup {
    return this.fb.group({
      name: [''],
      email: ['', [Validators.email]],
      phoneNumber: ['', Validators.required],
      role: ['user', Validators.required],
      status: ['active', Validators.required]
    });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(searchText => {
      if (searchText.trim()) {
        this.searchUsers(searchText);
      } else {
        this.loadUsers();
      }
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.users = response.data;
          this.totalUsers = response.total;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoading = false;
        }
      });
  }

  onSearch(event: any): void {
    this.searchTerm = event.target.value;
    this.searchSubject.next(this.searchTerm);
  }

  searchUsers(searchText: string): void {
    this.isLoading = true;
    this.userService.searchUsers(searchText, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.users = response.data;
          this.totalUsers = response.total;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error searching users:', error);
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesStatus = this.statusFilter === 'all' || user.status === this.statusFilter;
      const matchesRole = this.roleFilter === 'all' || user.role === this.roleFilter;
      return matchesStatus && matchesRole;
    });
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  onRoleFilterChange(role: string): void {
    this.roleFilter = role;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.searchTerm ? this.searchUsers(this.searchTerm) : this.loadUsers();
  }

  openAddModal(): void {
    this.userForm.reset({ role: 'user', status: 'active' });
    this.showUserModal = true;
  }

  openViewModal(user: IUser): void {
    this.selectedUser = user;
    this.showViewModal = true;
  }

  openEditModal(user: IUser): void {
    this.selectedUser = user;
    this.editForm.patchValue(user);
    this.showEditModal = true;
  }

  openDeleteModal(user: IUser): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  closeModals(): void {
    this.showUserModal = false;
    this.showDeleteModal = false;
    this.showViewModal = false;
    this.showEditModal = false;
    this.selectedUser = null;
  }

  createUser(): void {
    if (this.userForm.invalid) return;

    this.isSubmitting = true;
    this.userService.createUser(this.userForm.value)
      .subscribe({
        next: () => {
          this.loadUsers();
          this.closeModals();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.isSubmitting = false;
        }
      });
  }

  updateUser(): void {
    if (this.editForm.invalid || !this.selectedUser) return;

    this.isSubmitting = true;
    this.userService.updateUser(this.selectedUser._id, this.editForm.value)
      .subscribe({
        next: () => {
          this.loadUsers();
          this.closeModals();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.isSubmitting = false;
        }
      });
  }

  updateUserNameOnly(): void {
    if (!this.selectedUser) return;

    const newName = prompt('Enter new name:', this.selectedUser.name);
    if (newName && newName !== this.selectedUser.name) {
      this.userService.updateUserName(this.selectedUser._id, newName)
        .subscribe({
          next: () => {
            this.loadUsers();
          },
          error: (error) => console.error('Error updating name:', error)
        });
    }
  }

  updateUserStatus(user: IUser, newStatus: IUser['status']): void {
    this.userService.updateUser(user._id, { ...user, status: newStatus })
      .subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => console.error('Error updating status:', error)
      });
  }

  deleteUser(): void {
    if (!this.selectedUser) return;

    this.userService.deleteUser(this.selectedUser._id)
      .subscribe({
        next: () => {
          this.loadUsers();
          this.closeModals();
        },
        error: (error) => console.error('Error deleting user:', error)
      });
  }

  getStatusClass(status: string): string {
    const statusMap = {
      'active': 'status-active',
      'inactive': 'status-inactive',
      'pending': 'status-pending',
      'blocked': 'status-rejected'
    };
    return statusMap[status as keyof typeof statusMap] || '';
  }

  getTotalPages(): number {
    return Math.ceil(this.totalUsers / this.pageSize);
  }
}