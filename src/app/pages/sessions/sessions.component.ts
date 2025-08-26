import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { catchError, debounceTime, Subject, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { PageResponse, SessionListItem, SessionService } from 'src/app/services/session.service';
import { SessionStatus } from 'src/app/enums/session.enum';
import { UserRole } from 'src/app/enums/user.enum';
import { getBadgeClass, getStatusText } from 'src/app/utils/helper';
import { AuthService } from 'src/app/services/auth.service';
import { RequestSessionModalComponent } from 'src/app/components/modals/request-session-modal/request-session-modal.component';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RescheduleSessionModalComponent } from 'src/app/components/modals/reschedule-session-modal/reschedule-session-modal.component';

@Component({
  selector: 'app-sessions',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbDropdownModule],
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.scss'
})
export class SessionsComponent implements OnInit, OnDestroy {
  SessionStatus = SessionStatus;
  UserRole = UserRole;
  getStatusText = getStatusText;
  getBadgeClass = getBadgeClass;

  // role
  role?: UserRole;

  // table data
  rows: SessionListItem[] = [];
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
    status: ['' as '' | SessionStatus],
    dateFrom: [''],
    dateTo: ['']
  });

  private destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private auth: AuthService,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$
      .pipe(
        tap((u) => (this.role = u.role)),
        switchMap(() => this.load()),
        takeUntil(this.destroyed$)
      )
      .subscribe();

    this.form.valueChanges
      .pipe(
        debounceTime(250),
        tap(() => (this.page = 1)),
        switchMap(() => this.load()),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  load() {
    this.loading = true;
    const v = this.form.value;
    return this.sessionService
      .getSessions({
        search: v.search ?? undefined,
        status: (v.status ?? '') as any,
        dateFrom: v.dateFrom || undefined,
        dateTo: v.dateTo || undefined,
        page: this.page,
        pageSize: this.pageSize
      })
      .pipe(
        tap((res: PageResponse<SessionListItem>) => {
          this.rows = res.items;
          this.total = res.total;
          this.loading = false;
        }),
        catchError((err: any) => {
          this.loading = false;
          this.toastr.error(err?.error?.message || 'Error while fetching sessions');
          return throwError(() => new Error(err?.error?.message || 'Error while fetching sessions'));
        })
      );
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.load().subscribe();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.load().subscribe();
    }
  }

  changePageSize(n: number) {
    this.pageSize = n;
    this.page = 1;
    this.load().subscribe();
  }

  requestSession() {
    const modalRef = this.modalService.open(RequestSessionModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      () => {
        this.load().subscribe(); // Refresh sessions after creation
      },
      () => {
        // Modal dismissed
      }
    );
  }

  // helpers
  fullName(u?: any) {
    if (!u) return '';
    return `${u.firstName || ''} ${u.lastName || ''}`.trim();
  }

  locationOf(u?: any) {
    if (!u) return '';
    const parts = [u.streetAddress1, u.streetAddress2, u.city, u.state].filter(Boolean);
    return parts.join(', ');
  }

  resetFilters() {
    this.form.reset({ search: '', status: '', dateFrom: '', dateTo: '' });
  }

  trackById(_: number, row: SessionListItem) {
    return row.id;
  }

  openRescheduleModal(session: any): void {
    const modalRef = this.modalService.open(RescheduleSessionModalComponent, {
      size: 'md',
      backdrop: 'static'
    });
    modalRef.componentInstance.sessionId = session.id;
    modalRef.componentInstance.currentDate = session.date;
    modalRef.result.then(
      () => this.load().subscribe(),
      () => {}
    );
  }

  updateSessionStatus(sessionId: number, status: SessionStatus): void {
    this.loading = true;
    this.sessionService.updateSession(sessionId, { status }).subscribe({
      next: () => {
        this.toastr.success('Session updated successfully.');
        this.loading = false;
        this.load().subscribe();
      },
      error: () => {
        this.toastr.error('Failed to update session.');
        this.loading = false;
      }
    });
  }
}
