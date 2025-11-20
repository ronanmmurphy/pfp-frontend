import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { SessionService } from 'src/app/services/session.service';
import { SessionOutcome, SessionStatus } from 'src/app/enums/session.enum';
import { isFormError, isFormInvalid } from 'src/app/utils/form.helper';
import { CreateSessionFromEmailDto } from 'src/app/dtos/session.dto';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-session-feedback',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './session-feedback.component.html',
  styleUrl: './session-feedback.component.scss'
})
export class SessionFeedbackComponent implements OnInit, OnDestroy {
  /** Data */
  referralId: number | null = null;
  userId: number | null = null;
  private destroyed$ = new Subject<void>();

  /** Enums */
  SessionStatus = SessionStatus;
  SessionOutcome = SessionOutcome;

  /** Form */
  form!: FormGroup;

  /** Helpers */
  isFormInvalid = isFormInvalid;
  isFormError = isFormError;

  /** UI */
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      date: [null, Validators.required],
      status: [null, Validators.required],
      outcome: [null, Validators.required],
      otherOutcome: [null],
      rate: [null, Validators.required],
      feedback: [null]
    });

    this.route.queryParams.subscribe((params) => {
      if (params['referralId']) {
        this.referralId = Number(params['referralId']);
      }
      if (params['userId']) {
        this.userId = Number(params['userId']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  get f() {
    return this.form.controls;
  }

  saveSessionFeedback(): void {
    if (!this.referralId || !this.userId) {
      this.toastr.error('Invalid session');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Form is not valid. Please fill out all required fields');
      return;
    }

    this.submitting = true;

    const payload: CreateSessionFromEmailDto = {
      referralId: this.referralId,
      userId: this.userId,
      status: this.f['status']?.value,
      date: this.f['date']?.value,
      outcome: this.f['outcome']?.value,
      otherOutcome: this.f['otherOutcome']?.value,
      rate: this.f['rate']?.value,
      feedback: this.f['feedback']?.value
    };

    this.sessionService
      .createSessionFromEmail(payload)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.toastr.success('Session feedback submitted successfully.');
          this.submitting = false;
        },
        error: (err) => {
          this.toastr.error(err?.error?.message || 'Failed to submit session feedback.');
          console.log('Failed to submit session feedback: ', err);
          this.submitting = false;
        }
      });
  }
}
