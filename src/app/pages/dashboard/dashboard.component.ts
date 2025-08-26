// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, forkJoin, of, Subject, switchMap } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { DashboardService, SessionRow } from '../../services/dashboard.service';
import { UserRole } from 'src/app/enums/user.enum';
import { getBadgeClass, getStatusText } from 'src/app/utils/helper';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsCardComponent } from 'src/app/components/shared/stats-card/stats-card.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, StatsCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  UserRole = UserRole;

  // role & user
  role?: UserRole;

  // admin totals
  veterans = 0;
  photographers = 0;
  sessionsCompleted = 0;
  sessionsCanceled = 0;

  // user totals (photographer / veteran)
  mySessionsCompleted = 0;
  mySessionsCanceled = 0;

  // recent sessions
  recentSessions: SessionRow[] = [];
  loadingRecent = true;

  private destroyed$ = new Subject<void>();

  getBadgeClass = getBadgeClass;
  getStatusText = getStatusText;

  constructor(
    private auth: AuthService,
    private dash: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$
      .pipe(
        switchMap((user) => {
          this.role = user.role;

          const stats$ = user.role === UserRole.ADMIN ? this.dash.getAdminStats() : this.dash.getMyStats();

          const sessions$ = this.dash.getRecentSessions(10);

          return forkJoin([stats$, sessions$]).pipe(
            catchError((err) => {
              console.error('Dashboard load error', err);
              return of([null, []]);
            })
          );
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: ([stats, sessions]: any) => {
          if (this.role === UserRole.ADMIN) {
            this.veterans = stats.veterans;
            this.photographers = stats.photographers;
            this.sessionsCompleted = stats.sessionsCompleted;
            this.sessionsCanceled = stats.sessionsCanceled;
          } else {
            this.mySessionsCompleted = stats.sessionsCompleted;
            this.mySessionsCanceled = stats.sessionsCanceled;
          }
          this.recentSessions = sessions;
          this.loadingRecent = false;
        },
        error: () => {
          this.loadingRecent = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  seeMore() {
    this.router.navigate(['/sessions']);
  }
}
