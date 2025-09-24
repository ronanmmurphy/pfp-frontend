import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import { UserRole } from 'src/app/enums/user.enum';
import { Subject, firstValueFrom, takeUntil } from 'rxjs';
import { isFormError, isFormInvalid } from 'src/app/utils/form.helper';
import { IUser } from 'src/app/types/user.type';
import { CreateSessionDto, UpdateSessionDto } from 'src/app/dtos/session.dto';
import { ISession } from 'src/app/types/session.type';
import { SessionStatus } from 'src/app/enums/session.enum';
import { SessionService } from 'src/app/services/session.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IPaginatedResponse } from 'src/app/types/shared.type';
import { getFullName, getLocationText } from 'src/app/utils/user.helper';
import { formatDateTimeLocal } from 'src/app/utils/date.helper';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-session-edit-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './session-edit-modal.component.html',
  styleUrls: ['./session-edit-modal.component.scss'],
  standalone: true
})
export class SessionEditModalComponent {
  session: ISession;
  isEdit = false;
  role!: UserRole;

  form!: FormGroup;
  submitting = false;

  UserRole = UserRole;
  SessionStatus = SessionStatus;
  isFormInvalid = isFormInvalid;
  isFormError = isFormError;
  getFullName = getFullName;
  getLocationText = getLocationText;

  photographerList: IUser[] = [];
  veteranList: IUser[] = [];

  private destroyed$ = new Subject<void>();

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private userService: UserService,
    private sessionService: SessionService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      note: [null],
      status: [SessionStatus.SCHEDULED, Validators.required],
      date: ['', Validators.required],
      expirationDate: [null],
      photographerFeedback: [null],
      veteranFeedback: [null],
      photographerId: [null, Validators.required],
      veteranId: [null, Validators.required]
    });

    this.form.patchValue({
      name: this.session.name,
      note: this.session?.note ?? null,
      status: this.session.status,
      date: formatDateTimeLocal(new Date(this.session.date)),
      expirationDate: this.session?.expirationDate ? formatDateTimeLocal(new Date(this.session.expirationDate)) : null,
      photographerFeedback: this.session?.photographerFeedback ?? null,
      veteranFeedback: this.session?.veteranFeedback ?? null,
      photographerId: this.isAdmin && !this.isEdit ? null : (this.session.photographer?.id ?? null),
      veteranId: this.session.veteran?.id ?? null
    });
    this.form.get('photographerId')?.disable();

    if (this.isAdmin) {
      this.loadAllUsers(UserRole.PHOTOGRAPHER).catch((err) => {
        console.error('Failed to load photographers', err);
        this.toastr.error('Failed to load photographers');
      });
    }

    this.loadAllUsers(UserRole.VETERAN).catch((err) => {
      console.error('Failed to load veterans', err);
      this.toastr.error('Failed to load veterans');
    });

    this.applyRolePermissions();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private applyRolePermissions(): void {
    if (!this.form) return;

    if (this.isAdmin) {
      // Admin: enable everything
      this.form.enable({ emitEvent: false });
    } else if (this.isVeteran) {
      // Veteran: disable all except veteranFeedback
      Object.keys(this.form.controls).forEach((key) => {
        if (key !== 'veteranFeedback') {
          this.form.controls[key].disable({ emitEvent: false });
        } else {
          this.form.controls[key].enable({ emitEvent: false });
        }
      });
    } else if (this.isPhotographer) {
      // Photographer: disable only veteranFeedback
      Object.keys(this.form.controls).forEach((key) => {
        if (key === 'veteranFeedback') {
          this.form.controls[key].disable({ emitEvent: false });
        } else {
          this.form.controls[key].enable({ emitEvent: false });
        }
      });
    }
  }

  get f() {
    return this.form.controls;
  }

  get showFeedbackFields(): boolean {
    // Show feedback fields only if status is not Scheduled or Rescheduled
    const status = this.f['status'].value;
    return status !== SessionStatus.SCHEDULED && status !== SessionStatus.RESCHEDULED;
  }

  get isVeteran(): boolean {
    return this.role === UserRole.VETERAN;
  }

  get isPhotographer(): boolean {
    return this.role === UserRole.PHOTOGRAPHER;
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  private async loadAllUsers(role): Promise<void> {
    const pageSize = 50; // tune this as needed (or increase if API supports)
    let page = 1;
    const all: IUser[] = [];

    while (true) {
      const res: IPaginatedResponse<IUser> = await firstValueFrom(this.userService.getUsers({ role, search: '', page, pageSize }));

      const mapped = (res.items || []).map((user) => ({
        ...user,
        fullName: getFullName(user.firstName, user.lastName),
        location: getLocationText(user.streetAddress1, user.streetAddress2, user.city, user.state, user.postalCode)
      }));

      all.push(...mapped);

      // If last page or fewer items than pageSize, stop
      if (!res.items || res.items.length < pageSize) {
        break;
      }
      page++;
    }

    role === UserRole.PHOTOGRAPHER ? (this.photographerList = all) : (this.veteranList = all);
  }

  searchUser(term: string, item: any): boolean {
    const searchTerm = (term || '').toLowerCase().trim();
    if (!searchTerm) return true; // show everything when search is empty
    const fullName = (item.fullName ?? `${item.firstName} ${item.lastName}`).toLowerCase();
    return fullName.includes(searchTerm);
  }

  saveSession(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Form is not valid. Please fill out all required fields');
      return;
    }

    this.submitting = true;

    const payload: CreateSessionDto | UpdateSessionDto = {
      name: this.f['name'].value,
      note: this.f['note'].value ?? undefined,
      status: this.f['status'].value,
      date: this.f['date'].value,
      expirationDate: this.f['expirationDate'].value ?? undefined,
      photographerFeedback: this.f['photographerFeedback'].value ?? undefined,
      veteranFeedback: this.f['veteranFeedback'].value ?? undefined,
      photographerId: this.f['photographerId'].value,
      veteranId: this.f['veteranId'].value
    };

    const request =
      this.isEdit && this.session?.id
        ? this.sessionService.updateSession(this.session.id, payload as UpdateSessionDto)
        : this.sessionService.createSession(payload as CreateSessionDto);

    request.pipe(takeUntil(this.destroyed$)).subscribe({
      next: () => {
        this.toastr.success(this.isEdit ? 'Session updated successfully.' : 'Session created successfully.');
        this.submitting = false;
        this.modal.close();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || (this.isEdit ? 'Failed to update a session.' : 'Failed to create a session.'));
        this.submitting = false;
      }
    });
  }

  cancelSession(): void {
    this.modal.close();
  }
}
