import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, catchError, debounceTime, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { CreateUserPayload, UpdateUserPayload, UserPageResponse, UserRow, UserService } from 'src/app/services/user.service';
import { UserRole } from 'src/app/enums/user.enum';
import {
  getEligibilityText,
  getFullName,
  getLocationText,
  getMilitaryBranchAffiliationText,
  getRoleText,
  getSeekingEmploymentText
} from 'src/app/utils/helper';
import { UserEditModalComponent } from 'src/app/components/modals/user-edit-modal/user-edit-modal.component';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UserEditModalComponent],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true
})
export class UsersComponent implements OnInit, OnDestroy {
  UserRole = UserRole;
  getRoleText = getRoleText;
  getFullName = getFullName;
  getLocationText = getLocationText;
  getSeekingEmploymentText = getSeekingEmploymentText;
  getEligibilityText = getEligibilityText;
  getMilitaryBranchAffiliationText = getMilitaryBranchAffiliationText;

  // table data
  users: UserRow[] = [];
  loading = false;

  // pagination
  page = 1;
  pageSize = 10;
  total = 0;
  get totalPages() {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  // filters
  form = this.fb.group({
    search: [''],
    role: ['' as '' | UserRole]
  });

  // Modal state
  showModal = false;
  modalUser: CreateUserPayload | UpdateUserPayload = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: UserRole.PHOTOGRAPHER,
    phoneNumber: '',
    streetAddress1: '',
    latitude: null,
    longitude: null
  };
  isEditModal = false;

  private destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUsers().subscribe();
    this.form.valueChanges
      .pipe(
        debounceTime(250),
        tap(() => (this.page = 1)),
        switchMap(() => this.loadUsers()),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  loadUsers() {
    this.loading = true;
    const v = this.form.value;
    return this.userService
      .getUsers({
        search: v.search ?? undefined,
        role: (v.role ?? '') as any,
        page: this.page,
        pageSize: this.pageSize
      })
      .pipe(
        tap((res: UserPageResponse<UserRow>) => {
          this.users = res.items;
          this.total = res.total;
          this.loading = false;
        }),
        catchError((err: any) => {
          this.loading = false;
          this.toastr.error(err?.error?.message || 'Error while fetching users');
          return throwError(() => new Error(err?.error?.message || 'Error while fetching users'));
        })
      );
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadUsers().subscribe();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadUsers().subscribe();
    }
  }

  changePageSize(n: number) {
    this.pageSize = n;
    this.page = 1;
    this.loadUsers().subscribe();
  }

  addUser(): void {
    this.modalUser = {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: UserRole.PHOTOGRAPHER,
      phoneNumber: '',
      streetAddress1: '',
      latitude: null,
      longitude: null
    };
    this.isEditModal = false;
    this.showModal = true;
  }

  editUser(id: number): void {
    this.loading = true;
    this.userService
      .getUserById(id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (user) => {
          this.modalUser = { ...user };
          this.isEditModal = true;
          this.showModal = true;
          this.loading = false;
        },
        error: () => {
          this.toastr.error('Failed to load user.');
          this.loading = false;
        }
      });
  }

  deleteUser(id: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService
        .deleteUser(id)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.toastr.success('User deleted successfully.');
            this.loadUsers().subscribe();
          },
          error: () => {
            this.toastr.error('Failed to delete user.');
          }
        });
    }
  }

  trackById(_: number, row: UserRow) {
    return row.id;
  }

  onModalSave(): void {
    this.showModal = false;
    this.loadUsers().subscribe();
  }

  onModalCancel(): void {
    this.showModal = false;
  }
}
