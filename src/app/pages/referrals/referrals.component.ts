import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { catchError, debounceTime, Subject, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { UserRole } from 'src/app/enums/user.enum';
import { AuthService } from 'src/app/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IUser } from 'src/app/types/user.type';
import { getFullName } from 'src/app/utils/user.helper';
import { IPaginatedResponse } from 'src/app/types/shared.type';
import { ISession } from 'src/app/types/session.type';
import { GetReferralModalComponent } from 'src/app/modals/get-referral-modal/get-referral-modal.component';
import { ReferralStatus } from 'src/app/enums/referral.enum';
import { getReferralBadgeClass, getReferralStatusText } from 'src/app/utils/referral.helper';
import { ReferralService } from 'src/app/services/referral.service';

@Component({
  selector: 'app-referrals',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './referrals.component.html',
  styleUrl: './referrals.component.scss'
})
export class ReferralsComponent implements OnInit, OnDestroy {
  /** Data */
  currentUser: IUser | null = null;
  referrals: any[] = [];
  private destroyed$ = new Subject<void>();

  /** Enums */
  ReferralStatus = ReferralStatus;
  UserRole = UserRole;

  /** Form */
  form = this.fb.group({
    search: [null],
    status: [null as null | ReferralStatus],
    dateFrom: [null],
    dateTo: [null]
  });

  /** Helpers */
  getFullName = getFullName;
  getReferralBadgeClass = getReferralBadgeClass;
  getReferralStatusText = getReferralStatusText;

  /** Pagination */
  page = 1;
  pageSize = 10;
  total = 0;

  /** UI */
  loading = false;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private referralService: ReferralService,
    private toastr: ToastrService
  ) {}

  get totalPages() {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
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

    return this.referralService.getReferrals(params).pipe(
      tap((res: IPaginatedResponse<ISession>) => {
        this.referrals = res.items;
        this.total = res.total;
        this.loading = false;
      }),
      catchError((err: any) => {
        this.loading = false;
        this.toastr.error(err?.error?.message || 'Error while fetching referrals');
        return throwError(() => new Error(err?.error?.message || 'Error while fetching referrals'));
      })
    );
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
}
