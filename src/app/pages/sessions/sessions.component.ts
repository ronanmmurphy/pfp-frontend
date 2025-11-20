import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { catchError, debounceTime, Subject, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { SessionService } from 'src/app/services/session.service';
import { SessionStatus } from 'src/app/enums/session.enum';
import { UserRole } from 'src/app/enums/user.enum';
import { AuthService } from 'src/app/services/auth.service';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RescheduleSessionModalComponent } from 'src/app/modals/reschedule-session-modal/reschedule-session-modal.component';
import { getSessionBadgeClass, getSessionStatusText } from 'src/app/utils/session.helper';
import { IUser } from 'src/app/types/user.type';
import { IconDirective, IconService } from '@ant-design/icons-angular';
import { EditOutline, SettingOutline } from '@ant-design/icons-angular/icons';
import { getFullName, getLocationText } from 'src/app/utils/user.helper';
import { IPaginatedResponse } from 'src/app/types/shared.type';
import { ISession } from 'src/app/types/session.type';
import { SessionEditModalComponent } from 'src/app/modals/session-edit-modal/session-edit-modal.component';
import { GetReferralModalComponent } from 'src/app/modals/get-referral-modal/get-referral-modal.component';

@Component({
  selector: 'app-sessions',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbDropdownModule, IconDirective],
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.scss'
})
export class SessionsComponent implements OnInit, OnDestroy {
  private iconService = inject(IconService);

  SessionStatus = SessionStatus;
  UserRole = UserRole;
  getFullName = getFullName;
  getLocationText = getLocationText;
  getSessionStatusText = getSessionStatusText;
  getSessionBadgeClass = getSessionBadgeClass;

  currentUser: IUser | null = null;

  // table data
  rows: ISession[] = [];
  loading = false;

  // pagination
  page = 1;
  pageSize = 10;
  total = 0;
  get totalPages() {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  // filters
  selectedView: 'thisMonth' | 'waitlist' | 'all' = 'thisMonth';
  form = this.fb.group({
    search: [null],
    status: [null as null | SessionStatus],
    dateFrom: [null],
    dateTo: [null]
  });

  private destroyed$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private auth: AuthService,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {
    this.iconService.addIcon(...[EditOutline, SettingOutline]);
  }

  ngOnInit(): void {
    this.auth.currentUser$
      .pipe(
        tap((u) => (this.currentUser = u)),
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
    let startDate: string | undefined;
    let endDate: string | undefined;

    const now = new Date();
    if (this.selectedView === 'thisMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
    } else if (this.selectedView === 'waitlist') {
      startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
      endDate = undefined;
    }

    // if (v.dateFrom) startDate = v.dateFrom || undefined;

    // if (v.dateTo) endDate = v.dateTo || undefined;

    if (v.dateFrom) {
      const [y, m, d] = v.dateFrom.split('-').map(Number);
      startDate = new Date(y, m - 1, d).toISOString();
    }

    if (v.dateTo) {
      const [y, m, d] = v.dateTo.split('-').map(Number);
      endDate = new Date(y, m - 1, d).toISOString();
    }

    const params = {
      search: v.search ?? undefined,
      status: v.status ?? undefined,
      dateFrom: startDate,
      dateTo: endDate,
      page: this.page,
      pageSize: this.pageSize
    };

    return this.sessionService.getSessions(params).pipe(
      tap((res: IPaginatedResponse<ISession>) => {
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

  setView(view: 'thisMonth' | 'waitlist' | 'all'): void {
    this.selectedView = view;
    this.page = 1;
    this.resetFilters();
  }

  resetFilters() {
    this.form.reset({ search: null, status: null, dateFrom: null, dateTo: null });
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

  trackById(_: number, row: ISession) {
    return row.id;
  }

  createSession() {
    const modalRef = this.modalService.open(SessionEditModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.isEdit = false;
    modalRef.componentInstance.session = {
      id: null,
      name: null,
      status: SessionStatus.COMPLETED,
      date: null,
      photographer: this.currentUser,
      veteran: null
    };
    modalRef.componentInstance.role = this.currentUser.role;

    modalRef.result.then(
      () => {
        this.load().subscribe(); // Refresh sessions after creation
      },
      () => {
        // Modal dismissed
      }
    );
  }

  editSession(session: ISession) {
    const modalRef = this.modalService.open(SessionEditModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.componentInstance.isEdit = true;
    modalRef.componentInstance.session = session;
    modalRef.componentInstance.role = this.currentUser.role;

    modalRef.result.then(
      () => {
        this.load().subscribe(); // Refresh sessions after creation
      },
      () => {
        // Modal dismissed
      }
    );
  }

  // setMaxSessionsPerMonth() {
  //   const modalRef = this.modalService.open(SetMaxSessionsModalComponent, {
  //     size: 'lg',
  //     backdrop: 'static'
  //   });
  //   modalRef.componentInstance.userId = this.currentUser.id;
  //   modalRef.componentInstance.maxSessionsPerMonth = this.currentUser.maxSessionsPerMonth;

  //   modalRef.result.then(
  //     () => {
  //       this.auth.refreshCurrentUser().subscribe({
  //         next: (user) => {
  //           this.currentUser = user;
  //         },
  //         error: (err) => {
  //           console.error('Failed to refresh current user', err);
  //         }
  //       });
  //     },
  //     () => {
  //       // Modal dismissed
  //     }
  //   );
  // }

  getReferral() {
    const modalRef = this.modalService.open(GetReferralModalComponent, {
      size: 'xl',
      backdrop: 'static'
    });
    modalRef.componentInstance.user = this.currentUser;

    modalRef.result.then(() => {
      // Modal dismissed
    });
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
