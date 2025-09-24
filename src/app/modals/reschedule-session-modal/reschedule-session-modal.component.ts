import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/services/session.service';
import { SessionStatus } from 'src/app/enums/session.enum';
import { formatDateTimeLocal } from 'src/app/utils/date.helper';

@Component({
  selector: 'app-reschedule-session-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reschedule-session-modal.component.html',
  styleUrls: ['./reschedule-session-modal.component.scss'],
  standalone: true
})
export class RescheduleSessionModalComponent {
  @Input() sessionId!: number;
  @Input() currentDate!: string;
  form: FormGroup;
  loading = false;

  constructor(
    public modal: NgbActiveModal,
    private fb: FormBuilder,
    private sessionService: SessionService,
    private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      date: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Convert ISO string to datetime-local compatible format (YYYY-MM-DDTHH:mm)
    const date = new Date(this.currentDate);
    const formattedDate = formatDateTimeLocal(date);
    this.form.patchValue({ date: formattedDate });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Please select a valid date.');
      return;
    }

    this.loading = true;
    const newDate = this.form.get('date')?.value;
    this.sessionService.updateSession(this.sessionId, { date: newDate, status: SessionStatus.RESCHEDULED }).subscribe({
      next: () => {
        this.toastr.success('Session rescheduled successfully.');
        this.loading = false;
        this.modal.close(true);
      },
      error: () => {
        this.toastr.error('Failed to reschedule session.');
        this.loading = false;
      }
    });
  }

  cancel() {
    this.modal.dismiss();
  }
}
