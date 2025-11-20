// src/app/pages/dashboard/dashboard.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, forkJoin, of, Subject, switchMap } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AdminStats, DashboardService, SessionRow, UserStats } from '../../services/dashboard.service';
import { UserRole, UserStatus } from 'src/app/enums/user.enum';
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
  UserStatus = UserStatus;

  // role & user
  role?: UserRole;

  openToReferrals = true;

  // admin totals
  veterans = 0;
  photographers = 0;
  pendingPhotographers = 0;
  onboardingPhotographers = 0;
  approvedPhotographers = 0;
  deniedPhotographers = 0;
  sessionsCompleted = 0;
  sessionsIncomplete = 0;

  // user totals (photographer / veteran)
  mySessionsCompleted = 0;
  mySessionsIncomplete = 0;

  loading = true;

  private destroyed$ = new Subject<void>();

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
          this.openToReferrals = user.openToReferrals;
          const stats$ = user.role === UserRole.ADMIN ? this.dash.getAdminStats() : this.dash.getMyStats();
          return stats$.pipe(
            catchError((err) => {
              console.error('Failed to load stats', err);
              return of(null);
            })
          );
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe((stats) => {
        if (!stats) {
          this.loading = false;
          return;
        }

        if (this.role === UserRole.ADMIN) {
          const adminStats = stats as AdminStats;
          this.veterans = adminStats.veterans;
          this.photographers = adminStats.photographers;
          this.pendingPhotographers = adminStats.pendingPhotographers;
          this.onboardingPhotographers = adminStats.onboardingPhotographers;
          this.approvedPhotographers = adminStats.approvedPhotographers;
          this.deniedPhotographers = adminStats.deniedPhotographers;
          this.sessionsCompleted = adminStats.sessionsCompleted;
          this.sessionsIncomplete = adminStats.sessionsIncomplete;
        } else {
          const userStats = stats as UserStats;
          this.mySessionsCompleted = userStats.sessionsCompleted;
          this.mySessionsIncomplete = userStats.sessionsIncomplete;
        }

        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
